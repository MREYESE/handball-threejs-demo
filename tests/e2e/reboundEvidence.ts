/** Independent ballistic oracle for the unspun high-save fixture, in metres/seconds. */
export function verifyHighReboundArc(
  contact: { elapsedSeconds: number; position: { y: number }; outgoingVelocity?: { y: number } },
  gravity: number,
  samples: readonly { time: number; height: number }[],
  goalTop: number,
  terminalTime: number,
): { predictedApex: number; reachablePeak: number; observedPeak: number; maximumSamplingLoss: number } {
  const speed = contact.outgoingVelocity?.y ?? Number.NaN;
  if (!Number.isFinite(speed) || speed <= 5 || !Number.isFinite(gravity) || gravity >= 0 ||
      samples.length < 3 || !Number.isFinite(contact.position.y)) {
    throw new Error("High rebound requires real upward contact and sampled flight");
  }
  const apexAfterContact = -speed / gravity;
  const predictedApex = contact.position.y - speed * speed / (2 * gravity);
  if (predictedApex <= goalTop) throw new Error("Rebound must clear the regulation goal");
  let previousTime = contact.elapsedSeconds;
  let maximumGap = 0;
  for (const sample of samples) {
    const dt = sample.time - contact.elapsedSeconds;
    const expectedHeight = contact.position.y + speed * dt + gravity * dt * dt / 2;
    if (!Number.isFinite(sample.time) || !Number.isFinite(sample.height) || sample.time < previousTime ||
        Math.abs(sample.height - expectedHeight) > 1e-5) {
      throw new Error("Rebound samples must follow the physical contact velocity and gravity");
    }
    maximumGap = Math.max(maximumGap, sample.time - previousTime);
    previousTime = sample.time;
  }
  if (!Number.isFinite(terminalTime) || terminalTime <= contact.elapsedSeconds ||
      Math.abs(samples.at(-1)!.time - terminalTime) > 1e-8) {
    throw new Error("Rebound telemetry must span through the physical terminal");
  }
  // A physical volume exit may precede the unconstrained ballistic apex.
  const peakTime = Math.min(apexAfterContact, terminalTime - contact.elapsedSeconds);
  const reachablePeak = contact.position.y + speed * peakTime + gravity * peakTime * peakTime / 2;
  const maximumSamplingLoss = -gravity * maximumGap * maximumGap / 8;
  const observedPeak = Math.max(...samples.map(s => s.height));
  if (observedPeak <= goalTop || reachablePeak - observedPeak > maximumSamplingLoss + 1e-5) {
    throw new Error("Observed rebound peak must match the physically predicted apex within sample spacing");
  }
  return { predictedApex, reachablePeak, observedPeak, maximumSamplingLoss };
}
