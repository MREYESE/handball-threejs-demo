import type {
  BallFlightConfig,
  GoalConfig,
  GoalkeeperConfig,
  StandardTrajectoryConfig,
} from "../../config/types";
import { clamp, lerp, type Vec3 } from "../math";
import type { ShotOutcome } from "./outcome";
import { isInsideValidGoalTarget } from "./target";
import { standardShotDuration } from "./trajectory";

export type BallContactKind =
  | "GROUND"
  | "VERTICAL_POST"
  | "CROSSBAR"
  | "KEEPER"
  | "GOAL_PLANE"
  | "PLAY_VOLUME";
export type VerticalPost = "LEFT" | "RIGHT";

export interface BallContact {
  readonly kind: BallContactKind;
  readonly elapsedSeconds: number;
  readonly position: Vec3;
  readonly outcome: ShotOutcome | null;
  readonly post?: VerticalPost;
  readonly normal?: Vec3;
  readonly incomingVelocity?: Vec3;
  readonly outgoingVelocity?: Vec3;
}

interface MutableVec3 {
  x: number;
  y: number;
  z: number;
}

export interface BallFlightState {
  readonly playableVolume: BallFlightConfig["playableVolume"];
  readonly position: MutableVec3;
  readonly previousPosition: MutableVec3;
  readonly velocity: MutableVec3;
  readonly gravityMetersPerSecondSquared: number;
  readonly releasePower: number;
  readonly releaseLoft: number;
  readonly releaseSideSpin: number;
  readonly releaseTopSpin: number;
  readonly releaseBounceIntent: number;
  readonly launchLiftMeters: number;
  readonly sideSpinAccelerationMetersPerSecondSquared: number;
  readonly topSpinDropAccelerationMetersPerSecondSquared: number;
  readonly releaseSpeedMetersPerSecond: number;
  readonly initialVelocity: Vec3;
  readonly postRestitution: number;
  readonly crossbarRestitution: number;
  readonly groundRestitution: number;
  readonly minimumGroundReboundSpeedMetersPerSecond: number;
  readonly maximumGroundBounces: number;
  groundBounceCount: number;
  /** Historical timing cue retained for presentation only; never drives motion. */
  readonly durationSeconds: number;
  readonly contactHistory: BallContact[];
  elapsedSeconds: number;
  terminalState: ShotOutcome | null;
}

export interface GoalkeeperCollisionSweep {
  readonly previousPosition: Vec3;
  readonly currentPosition: Vec3;
}

const NO_CONTACT = Number.POSITIVE_INFINITY;
const FRAME_SEPARATION_METERS = 1e-6;
const MAXIMUM_POST_CONTACTS_PER_STEP = 4;
const MAXIMUM_CROSSBAR_CONTACTS_PER_STEP = 4;
const MAXIMUM_KEEPER_CONTACTS_PER_STEP = 1;
const POLYNOMIAL_ZERO_TOLERANCE = 1e-12;
const ROOT_DEDUPLICATION_TOLERANCE_SECONDS = 1e-10;

export function createBaselineBallFlight(
  release: Vec3,
  target: Vec3,
  power: number,
  trajectoryConfig: StandardTrajectoryConfig,
  flightConfig: BallFlightConfig,
  loft = 0,
  sideSpin = 0,
  topSpin = 0,
  bounceIntent = 0,
): BallFlightState {
  assertFiniteVector(release, "Ball release position");
  assertFiniteVector(target, "Ball aim target");
  assertFiniteFlightConfig(flightConfig);
  assertFiniteTrajectoryConfig(trajectoryConfig);
  const releasePower = clampedFinitePower(power);
  const releaseLoft = clampedFiniteLoft(loft);
  const releaseSideSpin = clampedFiniteSideSpin(sideSpin);
  const releaseTopSpin = clampedFiniteTopSpin(topSpin);
  const releaseBounceIntent = clampedFiniteBounceIntent(bounceIntent);
  const durationSeconds = standardShotDuration(releasePower, trajectoryConfig);
  const releaseSpeedMetersPerSecond = releaseSpeedForPower(
    releasePower,
    flightConfig,
  );
  const aimX = target.x - release.x;
  const launchLiftMeters = lerp(
    flightConfig.minimumLaunchLiftMeters,
    flightConfig.maximumLaunchLiftMeters,
    releaseLoft,
  );
  const aimY = target.y - release.y + launchLiftMeters - releaseBounceIntent * 1.8;
  const aimZ = target.z - release.z;
  const aimLength = Math.hypot(aimX, aimY, aimZ);
  if (!Number.isFinite(aimLength) || aimLength <= Number.EPSILON) {
    throw new RangeError("Ball launch direction must have finite non-zero length.");
  }
  const speedPerAimMeter = releaseSpeedMetersPerSecond / aimLength;
  const initialVelocity = Object.freeze({
    x: aimX * speedPerAimMeter,
    y: aimY * speedPerAimMeter,
    z: aimZ * speedPerAimMeter,
  });

  return {
    playableVolume: Object.freeze({ ...flightConfig.playableVolume }),
    position: copyMutable(release),
    previousPosition: copyMutable(release),
    velocity: copyMutable(initialVelocity),
    gravityMetersPerSecondSquared: flightConfig.gravityMetersPerSecondSquared,
    releasePower,
    releaseLoft,
    releaseSideSpin,
    releaseTopSpin,
    releaseBounceIntent,
    launchLiftMeters,
    // sideSpin retains the gesture's screen-space bow sign (+ = right).
    // The shooter-facing gameplay camera mirrors world X; convert exactly here.
    sideSpinAccelerationMetersPerSecondSquared:
      -releaseSideSpin *
      flightConfig.maximumSideSpinAccelerationMetersPerSecondSquared,
    topSpinDropAccelerationMetersPerSecondSquared:
      releaseTopSpin *
      flightConfig.maximumTopSpinDropAccelerationMetersPerSecondSquared,
    releaseSpeedMetersPerSecond,
    initialVelocity,
    postRestitution: clamp(flightConfig.postRestitution, 0, 1),
    crossbarRestitution: clamp(flightConfig.crossbarRestitution, 0, 1),
    groundRestitution: groundRestitutionForBounceIntent(
      releaseBounceIntent,
      flightConfig,
    ),
    minimumGroundReboundSpeedMetersPerSecond:
      flightConfig.minimumGroundReboundSpeedMetersPerSecond,
    maximumGroundBounces: flightConfig.maximumGroundBounces,
    groundBounceCount: 0,
    durationSeconds,
    elapsedSeconds: 0,
    contactHistory: [],
    terminalState: null,
  };
}

export function releaseSpeedForPower(
  power: number,
  config: BallFlightConfig,
): number {
  assertFiniteFlightConfig(config);
  return lerp(
    config.minimumReleaseSpeedMetersPerSecond,
    config.maximumReleaseSpeedMetersPerSecond,
    clampedFinitePower(power),
  );
}

export function groundRestitutionForBounceIntent(
  bounceIntent: number,
  config: BallFlightConfig,
): number {
  assertFiniteFlightConfig(config);
  return lerp(
    config.minimumGroundRestitution,
    config.maximumGroundRestitution,
    clampedFiniteBounceIntent(bounceIntent),
  );
}

export function advanceBallFlight(
  state: BallFlightState,
  stepSeconds: number,
  goalConfig: GoalConfig,
  goalkeeperConfig: GoalkeeperConfig,
  goalkeeperSweep: GoalkeeperCollisionSweep,
): ShotOutcome | null {
  if (state.terminalState !== null) {
    return state.terminalState;
  }
  if (!Number.isFinite(stepSeconds) || stepSeconds <= 0) {
    throw new RangeError("Ball flight step must be a positive finite number.");
  }
  assertFiniteBallState(state);

  state.previousPosition.x = state.position.x;
  state.previousPosition.y = state.position.y;
  state.previousPosition.z = state.position.z;

  let remainingSeconds = stepSeconds;
  let consumedSeconds = 0;
  let postContacts = 0;
  let crossbarContacts = 0;
  let keeperContacts = 0;
  while (remainingSeconds > Number.EPSILON) {
    const previousX = state.position.x;
    const previousY = state.position.y;
    const previousZ = state.position.z;
    const previousVelocityX = state.velocity.x;
    const previousVelocityY = state.velocity.y;
    const previousVelocityZ = state.velocity.z;
    const verticalAcceleration =
      state.gravityMetersPerSecondSquared -
      state.topSpinDropAccelerationMetersPerSecondSquared;
    const sideSpinAcceleration =
      state.sideSpinAccelerationMetersPerSecondSquared;
    const nextX =
      previousX +
      previousVelocityX * remainingSeconds +
      0.5 * sideSpinAcceleration * remainingSeconds * remainingSeconds;
    const nextY =
      previousY +
      previousVelocityY * remainingSeconds +
      0.5 * verticalAcceleration * remainingSeconds * remainingSeconds;
    const nextZ = previousZ + previousVelocityZ * remainingSeconds;
    const keeperStartFraction = consumedSeconds / stepSeconds;
    const keeperEndFraction =
      (consumedSeconds + remainingSeconds) / stepSeconds;
    const keeperStartX = lerpUnclamped(
      goalkeeperSweep.previousPosition.x,
      goalkeeperSweep.currentPosition.x,
      keeperStartFraction,
    );
    const keeperStartY = lerpUnclamped(
      goalkeeperSweep.previousPosition.y,
      goalkeeperSweep.currentPosition.y,
      keeperStartFraction,
    );
    const keeperStartZ = lerpUnclamped(
      goalkeeperSweep.previousPosition.z,
      goalkeeperSweep.currentPosition.z,
      keeperStartFraction,
    );
    const keeperEndX = lerpUnclamped(
      goalkeeperSweep.previousPosition.x,
      goalkeeperSweep.currentPosition.x,
      keeperEndFraction,
    );
    const keeperEndY = lerpUnclamped(
      goalkeeperSweep.previousPosition.y,
      goalkeeperSweep.currentPosition.y,
      keeperEndFraction,
    );
    const keeperEndZ = lerpUnclamped(
      goalkeeperSweep.previousPosition.z,
      goalkeeperSweep.currentPosition.z,
      keeperEndFraction,
    );
    const planeFraction = segmentPlaneFraction(
      previousZ,
      nextZ,
      goalConfig.center.z,
    );
    const groundFraction = ballisticGroundFraction(
      previousY,
      previousVelocityY,
      verticalAcceleration,
      remainingSeconds,
      goalConfig.ballRadiusMeters,
    );
    const keeperFraction =
      keeperContacts < MAXIMUM_KEEPER_CONTACTS_PER_STEP
        ? sweptBallisticKeeperFraction(
            previousX,
            previousY,
            previousZ,
            previousVelocityX,
            previousVelocityY,
            previousVelocityZ,
            sideSpinAcceleration,
            verticalAcceleration,
            remainingSeconds,
            keeperStartX,
            keeperStartY,
            keeperStartZ,
            keeperEndX,
            keeperEndY,
            keeperEndZ,
            goalkeeperConfig.saveRadiusMeters + goalConfig.ballRadiusMeters,
          )
        : NO_CONTACT;
    const postContact =
      postContacts < MAXIMUM_POST_CONTACTS_PER_STEP
        ? sweptVerticalPostContact(
            previousX,
            previousY,
            previousZ,
            previousVelocityX,
            previousVelocityY,
            previousVelocityZ,
            sideSpinAcceleration,
            verticalAcceleration,
            remainingSeconds,
            goalConfig,
          )
        : null;
    const postFraction = postContact?.fraction ?? NO_CONTACT;
    const crossbarContact =
      crossbarContacts < MAXIMUM_CROSSBAR_CONTACTS_PER_STEP
        ? sweptCrossbarContact(
            previousX,
            previousY,
            previousZ,
            previousVelocityX,
            previousVelocityY,
            previousVelocityZ,
            verticalAcceleration,
            sideSpinAcceleration,
            remainingSeconds,
            goalConfig,
          )
        : null;
    const crossbarFraction = crossbarContact?.fraction ?? NO_CONTACT;

    const physicalKind = earliestContactKind(
      groundFraction,
      postFraction,
      crossbarFraction,
      keeperFraction,
      planeFraction,
    );
    const physicalFraction =
      physicalKind === null ? NO_CONTACT :
      physicalKind === "GROUND" ? groundFraction :
      physicalKind === "VERTICAL_POST" ? postFraction :
      physicalKind === "CROSSBAR" ? crossbarFraction :
      physicalKind === "KEEPER" ? keeperFraction : planeFraction;
    const volumeFraction = playableVolumeExitFraction(
      state, remainingSeconds, goalConfig.ballRadiusMeters,
    );
    // Existing physical contacts, including a valid goal, win exact ties.
    const contactKind = volumeFraction < physicalFraction
      ? "PLAY_VOLUME" : physicalKind;
    const contactFraction = Math.min(volumeFraction, physicalFraction);
    if (contactKind === null) {
      state.position.x = nextX;
      state.position.y = nextY;
      state.position.z = nextZ;
      state.velocity.x =
        previousVelocityX + sideSpinAcceleration * remainingSeconds;
      state.velocity.y =
        previousVelocityY + verticalAcceleration * remainingSeconds;
      state.elapsedSeconds += remainingSeconds;
      return null;
    }

    const contactSeconds = remainingSeconds * contactFraction;
    state.position.x =
      previousX +
      previousVelocityX * contactSeconds +
      0.5 * sideSpinAcceleration * contactSeconds * contactSeconds;
    state.position.y =
      contactKind === "GROUND"
        ? goalConfig.ballRadiusMeters
        : previousY +
          previousVelocityY * contactSeconds +
          0.5 * verticalAcceleration * contactSeconds * contactSeconds;
    state.position.z = lerpUnclamped(previousZ, nextZ, contactFraction);
    state.velocity.x = previousVelocityX + sideSpinAcceleration * contactSeconds;
    state.velocity.y = previousVelocityY + verticalAcceleration * contactSeconds;
    state.velocity.z = previousVelocityZ;
    state.elapsedSeconds += contactSeconds;
    consumedSeconds += contactSeconds;
    remainingSeconds -= contactSeconds;

    if (contactKind === "GROUND") {
      const contactPosition = frozenCopy(state.position);
      const incomingVelocity = frozenCopy(state.velocity);
      const reboundVelocityY =
        -state.velocity.y * state.groundRestitution;
      const canRebound =
        state.groundBounceCount < state.maximumGroundBounces &&
        state.velocity.y < 0 &&
        reboundVelocityY >= state.minimumGroundReboundSpeedMetersPerSecond;
      if (canRebound) {
        state.velocity.y = reboundVelocityY;
        state.position.y =
          goalConfig.ballRadiusMeters + FRAME_SEPARATION_METERS;
        const outgoingVelocity = frozenCopy(state.velocity);
        state.contactHistory.push(
          Object.freeze({
            kind: "GROUND",
            elapsedSeconds: state.elapsedSeconds,
            position: contactPosition,
            normal: Object.freeze({ x: 0, y: 1, z: 0 }),
            incomingVelocity,
            outgoingVelocity,
            outcome: null,
          }),
        );
        state.groundBounceCount += 1;
        continue;
      }
    }

    if (contactKind === "VERTICAL_POST") {
      if (postContact === null) {
        throw new Error("Vertical-post contact is missing swept collision data.");
      }
      const contactPosition = frozenCopy(state.position);
      const incomingVelocity = frozenCopy(state.velocity);
      const normalVelocity =
        state.velocity.x * postContact.normal.x +
        state.velocity.z * postContact.normal.z;
      const reflectionScale =
        (1 + state.postRestitution) * normalVelocity;
      state.velocity.x -= reflectionScale * postContact.normal.x;
      state.velocity.z -= reflectionScale * postContact.normal.z;
      const expandedRadius =
        goalConfig.ballRadiusMeters + goalConfig.postThicknessMeters / 2;
      state.position.x =
        postContact.centerX +
        postContact.normal.x * (expandedRadius + FRAME_SEPARATION_METERS);
      state.position.z =
        goalConfig.center.z +
        postContact.normal.z * (expandedRadius + FRAME_SEPARATION_METERS);
      const outgoingVelocity = frozenCopy(state.velocity);
      state.contactHistory.push(
        Object.freeze({
          kind: "VERTICAL_POST",
          post: postContact.post,
          elapsedSeconds: state.elapsedSeconds,
          position: contactPosition,
          normal: postContact.normal,
          incomingVelocity,
          outgoingVelocity,
          outcome: null,
        }),
      );
      postContacts += 1;
      continue;
    }

    if (contactKind === "CROSSBAR") {
      if (crossbarContact === null) {
        throw new Error("Crossbar contact is missing swept collision data.");
      }
      const contactPosition = frozenCopy(state.position);
      const incomingVelocity = frozenCopy(state.velocity);
      const normalVelocity =
        state.velocity.y * crossbarContact.normal.y +
        state.velocity.z * crossbarContact.normal.z;
      const reflectionScale =
        (1 + state.crossbarRestitution) * normalVelocity;
      state.velocity.y -= reflectionScale * crossbarContact.normal.y;
      state.velocity.z -= reflectionScale * crossbarContact.normal.z;
      const expandedRadius =
        goalConfig.ballRadiusMeters + goalConfig.postThicknessMeters / 2;
      state.position.y =
        crossbarContact.centerY +
        crossbarContact.normal.y *
          (expandedRadius + FRAME_SEPARATION_METERS);
      state.position.z =
        goalConfig.center.z +
        crossbarContact.normal.z *
          (expandedRadius + FRAME_SEPARATION_METERS);
      const outgoingVelocity = frozenCopy(state.velocity);
      state.contactHistory.push(
        Object.freeze({
          kind: "CROSSBAR",
          elapsedSeconds: state.elapsedSeconds,
          position: contactPosition,
          normal: crossbarContact.normal,
          incomingVelocity,
          outgoingVelocity,
          outcome: null,
        }),
      );
      crossbarContacts += 1;
      continue;
    }

    if (contactKind === "KEEPER") {
      const contactPosition = frozenCopy(state.position);
      const incomingVelocity = frozenCopy(state.velocity);
      const keeperContactX = lerpUnclamped(
        keeperStartX,
        keeperEndX,
        contactFraction,
      );
      const keeperContactY = lerpUnclamped(
        keeperStartY,
        keeperEndY,
        contactFraction,
      );
      const keeperContactZ = lerpUnclamped(
        keeperStartZ,
        keeperEndZ,
        contactFraction,
      );
      const keeperVelocityX =
        (goalkeeperSweep.currentPosition.x -
          goalkeeperSweep.previousPosition.x) /
        stepSeconds;
      const keeperVelocityY =
        (goalkeeperSweep.currentPosition.y -
          goalkeeperSweep.previousPosition.y) /
        stepSeconds;
      const keeperVelocityZ =
        (goalkeeperSweep.currentPosition.z -
          goalkeeperSweep.previousPosition.z) /
        stepSeconds;
      const relativeVelocityX = state.velocity.x - keeperVelocityX;
      const relativeVelocityY = state.velocity.y - keeperVelocityY;
      const relativeVelocityZ = state.velocity.z - keeperVelocityZ;
      const normal = normalizedKeeperContactNormal(
        state.position.x - keeperContactX,
        state.position.y - keeperContactY,
        state.position.z - keeperContactZ,
        relativeVelocityX,
        relativeVelocityY,
        relativeVelocityZ,
      );
      const incomingNormalVelocity =
        relativeVelocityX * normal.x +
        relativeVelocityY * normal.y +
        relativeVelocityZ * normal.z;
      const reflectionScale =
        incomingNormalVelocity < 0
          ? (1 + clamp(goalkeeperConfig.contactRestitution, 0, 1)) *
            incomingNormalVelocity
          : 0;
      state.velocity.x =
        relativeVelocityX - reflectionScale * normal.x + keeperVelocityX;
      state.velocity.y =
        relativeVelocityY - reflectionScale * normal.y + keeperVelocityY;
      state.velocity.z =
        relativeVelocityZ - reflectionScale * normal.z + keeperVelocityZ;
      const overlapRadius =
        goalkeeperConfig.saveRadiusMeters + goalConfig.ballRadiusMeters;
      state.position.x =
        keeperContactX + normal.x * (overlapRadius + FRAME_SEPARATION_METERS);
      state.position.y =
        keeperContactY + normal.y * (overlapRadius + FRAME_SEPARATION_METERS);
      state.position.z =
        keeperContactZ + normal.z * (overlapRadius + FRAME_SEPARATION_METERS);
      const outgoingVelocity = frozenCopy(state.velocity);
      state.contactHistory.push(
        Object.freeze({
          kind: "KEEPER",
          elapsedSeconds: state.elapsedSeconds,
          position: contactPosition,
          normal,
          incomingVelocity,
          outgoingVelocity,
          outcome: null,
        }),
      );
      keeperContacts += 1;
      continue;
    }

    const hasKeeperContact = state.contactHistory.some(
      (contact) => contact.kind === "KEEPER",
    );
    const outcome: ShotOutcome =
      contactKind === "GOAL_PLANE" &&
      isInsideValidGoalTarget(state.position, goalConfig)
        ? "GOAL"
        : hasKeeperContact
          ? "SAVED"
          : "MISS";
    state.terminalState = outcome;
    state.contactHistory.push(
      Object.freeze({
        kind: contactKind,
        elapsedSeconds: state.elapsedSeconds,
        position: frozenCopy(state.position),
        outcome,
      }),
    );
    return outcome;
  }
  return null;
}

function clampedFinitePower(power: number): number {
  if (!Number.isFinite(power)) {
    throw new RangeError("Ball release power must be finite.");
  }
  return clamp(power, 0, 1);
}

function clampedFiniteLoft(loft: number): number {
  if (!Number.isFinite(loft)) {
    throw new RangeError("Ball release loft must be finite.");
  }
  return clamp(loft, 0, 1);
}

function clampedFiniteSideSpin(sideSpin: number): number {
  if (!Number.isFinite(sideSpin)) {
    throw new RangeError("Ball release side-spin must be finite.");
  }
  return clamp(sideSpin, -1, 1);
}

function clampedFiniteTopSpin(topSpin: number): number {
  if (!Number.isFinite(topSpin)) {
    throw new RangeError("Ball release top-spin must be finite.");
  }
  return clamp(topSpin, 0, 1);
}

function clampedFiniteBounceIntent(bounceIntent: number): number {
  if (!Number.isFinite(bounceIntent)) {
    throw new RangeError("Ball release bounce intent must be finite.");
  }
  return clamp(bounceIntent, 0, 1);
}

function assertFiniteFlightConfig(config: BallFlightConfig): void {
  const values = [
    config.playableVolume.halfWidthMeters,
    config.playableVolume.ceilingHeightMeters,
    config.playableVolume.minimumZMeters,
    config.minimumReleaseSpeedMetersPerSecond,
    config.maximumReleaseSpeedMetersPerSecond,
    config.minimumLaunchLiftMeters,
    config.maximumLaunchLiftMeters,
    config.maximumSideSpinAccelerationMetersPerSecondSquared,
    config.maximumTopSpinDropAccelerationMetersPerSecondSquared,
    config.gravityMetersPerSecondSquared,
    config.postRestitution,
    config.crossbarRestitution,
    config.minimumGroundRestitution,
    config.maximumGroundRestitution,
    config.minimumGroundReboundSpeedMetersPerSecond,
    config.maximumGroundBounces,
  ];
  if (!values.every(Number.isFinite)) {
    throw new RangeError("Ball flight configuration must contain only finite values.");
  }
  if (config.playableVolume.halfWidthMeters <= 0 ||
      config.playableVolume.ceilingHeightMeters <= 0 ||
      config.playableVolume.minimumZMeters >= 0) {
    throw new RangeError("Playable arena volume must surround the release area.");
  }
  if (
    config.minimumReleaseSpeedMetersPerSecond <= 0 ||
    config.maximumReleaseSpeedMetersPerSecond <
      config.minimumReleaseSpeedMetersPerSecond
  ) {
    throw new RangeError("Ball release-speed bounds must be positive and ordered.");
  }
  if (
    config.minimumLaunchLiftMeters < 0 ||
    config.maximumLaunchLiftMeters < config.minimumLaunchLiftMeters
  ) {
    throw new RangeError("Ball launch-lift bounds must be non-negative and ordered.");
  }
  if (config.maximumSideSpinAccelerationMetersPerSecondSquared <= 0) {
    throw new RangeError("Ball side-spin acceleration bound must be positive.");
  }
  if (config.maximumTopSpinDropAccelerationMetersPerSecondSquared <= 0) {
    throw new RangeError("Ball top-spin drop acceleration bound must be positive.");
  }
  if (config.gravityMetersPerSecondSquared >= 0) {
    throw new RangeError("Ball flight gravity must be finite and negative.");
  }
  if (
    config.minimumGroundRestitution < 0 ||
    config.maximumGroundRestitution < config.minimumGroundRestitution ||
    config.maximumGroundRestitution > 1
  ) {
    throw new RangeError("Ground restitution bounds must be ordered within [0, 1].");
  }
  if (config.minimumGroundReboundSpeedMetersPerSecond <= 0) {
    throw new RangeError("Ground settling speed must be positive.");
  }
  if (
    !Number.isInteger(config.maximumGroundBounces) ||
    config.maximumGroundBounces < 0 ||
    config.maximumGroundBounces > 1
  ) {
    throw new RangeError("Maximum ground bounces must be an integer within [0, 1].");
  }
}

function assertFiniteTrajectoryConfig(config: StandardTrajectoryConfig): void {
  const values = [
    config.minimumDurationSeconds,
    config.maximumDurationSeconds,
    config.arcHeightMeters,
    config.resetDelaySeconds,
  ];
  if (!values.every(Number.isFinite)) {
    throw new RangeError("Nominal trajectory configuration must be finite.");
  }
  if (
    config.minimumDurationSeconds <= 0 ||
    config.maximumDurationSeconds < config.minimumDurationSeconds ||
    config.arcHeightMeters < 0 ||
    config.resetDelaySeconds < 0
  ) {
    throw new RangeError("Nominal trajectory configuration is out of bounds.");
  }
}

function assertFiniteVector(value: Vec3, label: string): void {
  if (![value.x, value.y, value.z].every(Number.isFinite)) {
    throw new RangeError(`${label} must contain only finite values.`);
  }
}

function assertFiniteBallState(state: BallFlightState): void {
  assertFiniteVector(state.position, "Ball position");
  assertFiniteVector(state.previousPosition, "Previous ball position");
  assertFiniteVector(state.velocity, "Ball velocity");
  assertFiniteVector(state.initialVelocity, "Initial ball velocity");
  if (
    !Number.isFinite(state.gravityMetersPerSecondSquared) ||
    !Number.isFinite(state.releasePower) ||
    !Number.isFinite(state.releaseLoft) ||
    !Number.isFinite(state.releaseSideSpin) ||
    !Number.isFinite(state.releaseTopSpin) ||
    !Number.isFinite(state.releaseBounceIntent) ||
    !Number.isFinite(state.launchLiftMeters) ||
    !Number.isFinite(state.sideSpinAccelerationMetersPerSecondSquared) ||
    !Number.isFinite(state.topSpinDropAccelerationMetersPerSecondSquared) ||
    !Number.isFinite(state.releaseSpeedMetersPerSecond) ||
    !Number.isFinite(state.postRestitution) ||
    !Number.isFinite(state.crossbarRestitution) ||
    !Number.isFinite(state.groundRestitution) ||
    !Number.isFinite(state.minimumGroundReboundSpeedMetersPerSecond) ||
    !Number.isFinite(state.maximumGroundBounces) ||
    !Number.isFinite(state.groundBounceCount) ||
    !Number.isFinite(state.durationSeconds) ||
    !Number.isFinite(state.elapsedSeconds)
  ) {
    throw new RangeError("Ball flight state must remain finite.");
  }
  if (state.releaseSideSpin < -1 || state.releaseSideSpin > 1) {
    throw new RangeError("Ball release side-spin must remain within [-1, 1].");
  }
  if (state.releaseTopSpin < 0 || state.releaseTopSpin > 1) {
    throw new RangeError("Ball release top-spin must remain within [0, 1].");
  }
  if (state.releaseBounceIntent < 0 || state.releaseBounceIntent > 1) {
    throw new RangeError("Ball release bounce intent must remain within [0, 1].");
  }
  if (state.groundRestitution < 0 || state.groundRestitution > 1) {
    throw new RangeError("Ball ground restitution must remain within [0, 1].");
  }
  if (state.minimumGroundReboundSpeedMetersPerSecond <= 0) {
    throw new RangeError("Ball ground settling speed must remain positive.");
  }
  if (
    !Number.isInteger(state.maximumGroundBounces) ||
    !Number.isInteger(state.groundBounceCount) ||
    state.maximumGroundBounces < 0 ||
    state.maximumGroundBounces > 1 ||
    state.groundBounceCount < 0 ||
    state.groundBounceCount > state.maximumGroundBounces
  ) {
    throw new RangeError("Ball ground-contact counts must remain bounded integers.");
  }
  if (state.topSpinDropAccelerationMetersPerSecondSquared < 0) {
    throw new RangeError("Ball top-spin drop acceleration must remain non-negative.");
  }
}

function earliestContactKind(
  groundFraction: number,
  postFraction: number,
  crossbarFraction: number,
  keeperFraction: number,
  planeFraction: number,
): BallContactKind | null {
  // Equal fractions resolve GROUND, frame, KEEPER, then GOAL_PLANE. Solid
  // surfaces win over the scoring plane at the same instant.
  if (
    groundFraction <= keeperFraction &&
    groundFraction <= postFraction &&
    groundFraction <= crossbarFraction &&
    groundFraction <= planeFraction
  ) {
    return groundFraction === NO_CONTACT ? null : "GROUND";
  }
  if (
    postFraction <= crossbarFraction &&
    postFraction <= keeperFraction &&
    postFraction <= planeFraction
  ) {
    return "VERTICAL_POST";
  }
  if (crossbarFraction <= keeperFraction && crossbarFraction <= planeFraction) {
    return "CROSSBAR";
  }
  if (keeperFraction <= planeFraction) {
    return "KEEPER";
  }
  return "GOAL_PLANE";
}

interface SweptCrossbarContact {
  readonly fraction: number;
  readonly centerY: number;
  readonly normal: Vec3;
}

function sweptCrossbarContact(
  previousX: number,
  previousY: number,
  previousZ: number,
  velocityX: number,
  velocityY: number,
  velocityZ: number,
  verticalAcceleration: number,
  sideSpinAcceleration: number,
  stepSeconds: number,
  goalConfig: GoalConfig,
): SweptCrossbarContact | null {
  const centerY =
    goalConfig.center.y +
    goalConfig.heightMeters / 2 +
    goalConfig.postThicknessMeters / 2;
  const centerlineHalfLength =
    goalConfig.widthMeters / 2 + goalConfig.postThicknessMeters / 2;
  const expandedRadius =
    goalConfig.ballRadiusMeters + goalConfig.postThicknessMeters / 2;
  const accelerationY = 0.5 * verticalAcceleration;
  const relativeY = previousY - centerY;
  const relativeZ = previousZ - goalConfig.center.z;
  const roots = polynomialRootsInInterval(
    [
      relativeY * relativeY +
        relativeZ * relativeZ -
        expandedRadius * expandedRadius,
      2 * (relativeY * velocityY + relativeZ * velocityZ),
      velocityY * velocityY +
        2 * relativeY * accelerationY +
        velocityZ * velocityZ,
      2 * velocityY * accelerationY,
      accelerationY * accelerationY,
    ],
    0,
    stepSeconds,
  );

  for (const contactSeconds of roots) {
    const contactX =
      previousX +
      velocityX * contactSeconds +
      0.5 * sideSpinAcceleration * contactSeconds * contactSeconds;
    if (
      Math.abs(contactX - goalConfig.center.x) > centerlineHalfLength
    ) {
      continue;
    }
    const contactY =
      previousY +
      velocityY * contactSeconds +
      accelerationY * contactSeconds * contactSeconds;
    const contactZ = previousZ + velocityZ * contactSeconds;
    const normalY = (contactY - centerY) / expandedRadius;
    const normalZ = (contactZ - goalConfig.center.z) / expandedRadius;
    const contactVelocityY = velocityY + verticalAcceleration * contactSeconds;
    if (contactVelocityY * normalY + velocityZ * normalZ >= 0) {
      continue;
    }
    return {
      fraction: contactSeconds / stepSeconds,
      centerY,
      normal: Object.freeze({ x: 0, y: normalY, z: normalZ }),
    };
  }
  return null;
}

function polynomialRootsInInterval(
  coefficients: readonly number[],
  minimum: number,
  maximum: number,
): number[] {
  let degree = coefficients.length - 1;
  while (
    degree > 0 &&
    Math.abs(coefficients[degree] ?? 0) <= POLYNOMIAL_ZERO_TOLERANCE
  ) {
    degree -= 1;
  }
  if (degree === 0) {
    return [];
  }
  if (degree === 1) {
    const slope = coefficients[1] ?? 0;
    const root = -(coefficients[0] ?? 0) / slope;
    return root >= minimum && root <= maximum ? [root] : [];
  }

  const derivative = Array.from(
    { length: degree },
    (_, index) => (coefficients[index + 1] ?? 0) * (index + 1),
  );
  const criticalPoints = polynomialRootsInInterval(
    derivative,
    minimum,
    maximum,
  );
  const boundaries = [minimum, ...criticalPoints, maximum];
  const roots: number[] = [];
  for (const boundary of boundaries) {
    if (
      Math.abs(evaluatePolynomial(coefficients, degree, boundary)) <=
      POLYNOMIAL_ZERO_TOLERANCE
    ) {
      appendDistinctRoot(roots, boundary);
    }
  }
  for (let index = 0; index + 1 < boundaries.length; index += 1) {
    let low = boundaries[index] ?? minimum;
    let high = boundaries[index + 1] ?? maximum;
    let lowValue = evaluatePolynomial(coefficients, degree, low);
    const highValue = evaluatePolynomial(coefficients, degree, high);
    if (lowValue === 0 || highValue === 0 || lowValue * highValue > 0) {
      continue;
    }
    for (let iteration = 0; iteration < 64; iteration += 1) {
      const midpoint = (low + high) / 2;
      const midpointValue = evaluatePolynomial(coefficients, degree, midpoint);
      if (midpointValue === 0) {
        low = midpoint;
        high = midpoint;
        break;
      }
      if (lowValue * midpointValue < 0) {
        high = midpoint;
      } else {
        low = midpoint;
        lowValue = midpointValue;
      }
    }
    appendDistinctRoot(roots, (low + high) / 2);
  }
  roots.sort((left, right) => left - right);
  return roots;
}

function evaluatePolynomial(
  coefficients: readonly number[],
  degree: number,
  value: number,
): number {
  let result = coefficients[degree] ?? 0;
  for (let index = degree - 1; index >= 0; index -= 1) {
    result = result * value + (coefficients[index] ?? 0);
  }
  return result;
}

function appendDistinctRoot(roots: number[], root: number): void {
  if (
    roots.every(
      (candidate) =>
        Math.abs(candidate - root) > ROOT_DEDUPLICATION_TOLERANCE_SECONDS,
    )
  ) {
    roots.push(root);
  }
}

interface SweptVerticalPostContact {
  readonly fraction: number;
  readonly post: VerticalPost;
  readonly centerX: number;
  readonly normal: Vec3;
}

function sweptVerticalPostContact(
  previousX: number,
  previousY: number,
  previousZ: number,
  previousVelocityX: number,
  previousVelocityY: number,
  previousVelocityZ: number,
  sideSpinAcceleration: number,
  verticalAcceleration: number,
  stepSeconds: number,
  goalConfig: GoalConfig,
): SweptVerticalPostContact | null {
  const postOffset =
    goalConfig.widthMeters / 2 + goalConfig.postThicknessMeters / 2;
  const expandedRadius =
    goalConfig.ballRadiusMeters + goalConfig.postThicknessMeters / 2;
  const halfSideSpinAcceleration = 0.5 * sideSpinAcceleration;
  let earliest: SweptVerticalPostContact | null = null;

  for (const post of ["LEFT", "RIGHT"] as const) {
    const centerX =
      goalConfig.center.x + (post === "LEFT" ? -postOffset : postOffset);
    const startX = previousX - centerX;
    const startZ = previousZ - goalConfig.center.z;
    const roots = polynomialRootsInInterval(
      [
        startX * startX +
          startZ * startZ -
          expandedRadius * expandedRadius,
        2 *
          (startX * previousVelocityX +
            startZ * previousVelocityZ),
        previousVelocityX * previousVelocityX +
          2 * startX * halfSideSpinAcceleration +
          previousVelocityZ * previousVelocityZ,
        2 * previousVelocityX * halfSideSpinAcceleration,
        halfSideSpinAcceleration * halfSideSpinAcceleration,
      ],
      0,
      stepSeconds,
    );
    for (const contactSeconds of roots) {
      const fraction = contactSeconds / stepSeconds;
      if (earliest !== null && fraction >= earliest.fraction) {
        continue;
      }
      const contactY =
        previousY +
        previousVelocityY * contactSeconds +
        0.5 * verticalAcceleration * contactSeconds * contactSeconds;
      const postTop =
        goalConfig.center.y +
        goalConfig.heightMeters / 2 +
        goalConfig.postThicknessMeters;
      if (contactY < goalConfig.ballRadiusMeters || contactY > postTop) {
        continue;
      }
      const contactX =
        previousX +
        previousVelocityX * contactSeconds +
        halfSideSpinAcceleration * contactSeconds * contactSeconds;
      const contactZ = previousZ + previousVelocityZ * contactSeconds;
      const normalX = (contactX - centerX) / expandedRadius;
      const normalZ = (contactZ - goalConfig.center.z) / expandedRadius;
      const contactVelocityX =
        previousVelocityX + sideSpinAcceleration * contactSeconds;
      if (
        contactVelocityX * normalX + previousVelocityZ * normalZ >= 0
      ) {
        continue;
      }
      earliest = {
        fraction,
        post,
        centerX,
        normal: Object.freeze({ x: normalX, y: 0, z: normalZ }),
      };
    }
  }
  return earliest;
}

function ballisticGroundFraction(
  previousY: number,
  previousVelocityY: number,
  verticalAcceleration: number,
  stepSeconds: number,
  groundHeight: number,
): number {
  const heightAboveGround = previousY - groundHeight;
  if (heightAboveGround < 0) {
    return 0;
  }

  const accelerationTerm = 0.5 * verticalAcceleration;
  if (Math.abs(accelerationTerm) <= Number.EPSILON) {
    if (previousVelocityY >= 0) {
      return heightAboveGround === 0 ? 0 : NO_CONTACT;
    }
    const contactSeconds = -heightAboveGround / previousVelocityY;
    return contactSeconds >= 0 && contactSeconds <= stepSeconds
      ? contactSeconds / stepSeconds
      : NO_CONTACT;
  }

  const discriminant =
    previousVelocityY * previousVelocityY -
    4 * accelerationTerm * heightAboveGround;
  if (discriminant < 0) {
    return NO_CONTACT;
  }

  const rootScale = 2 * accelerationTerm;
  const rootOffset = -previousVelocityY;
  const rootDistance = Math.sqrt(discriminant);
  const firstSeconds = (rootOffset - rootDistance) / rootScale;
  const secondSeconds = (rootOffset + rootDistance) / rootScale;
  let contactSeconds = NO_CONTACT;
  if (
    firstSeconds >= 0 &&
    firstSeconds <= stepSeconds &&
    previousVelocityY + verticalAcceleration * firstSeconds <= 0
  ) {
    contactSeconds = firstSeconds;
  }
  if (
    secondSeconds >= 0 &&
    secondSeconds <= stepSeconds &&
    previousVelocityY + verticalAcceleration * secondSeconds <= 0 &&
    secondSeconds < contactSeconds
  ) {
    contactSeconds = secondSeconds;
  }
  return contactSeconds === NO_CONTACT
    ? NO_CONTACT
    : contactSeconds / stepSeconds;
}

function segmentPlaneFraction(
  previousZ: number,
  currentZ: number,
  planeZ: number,
): number {
  if (previousZ >= planeZ || currentZ < planeZ || currentZ === previousZ) {
    return NO_CONTACT;
  }
  return (planeZ - previousZ) / (currentZ - previousZ);
}

function sweptBallisticKeeperFraction(
  previousX: number,
  previousY: number,
  previousZ: number,
  velocityX: number,
  velocityY: number,
  velocityZ: number,
  horizontalAcceleration: number,
  verticalAcceleration: number,
  stepSeconds: number,
  keeperPreviousX: number,
  keeperPreviousY: number,
  keeperPreviousZ: number,
  keeperCurrentX: number,
  keeperCurrentY: number,
  keeperCurrentZ: number,
  overlapRadius: number,
): number {
  const relativeStartX = previousX - keeperPreviousX;
  const relativeStartY = previousY - keeperPreviousY;
  const relativeStartZ = previousZ - keeperPreviousZ;
  const relativeVelocityX =
    velocityX - (keeperCurrentX - keeperPreviousX) / stepSeconds;
  const relativeVelocityY =
    velocityY - (keeperCurrentY - keeperPreviousY) / stepSeconds;
  const relativeVelocityZ =
    velocityZ - (keeperCurrentZ - keeperPreviousZ) / stepSeconds;
  const halfAccelerationX = 0.5 * horizontalAcceleration;
  const halfAccelerationY = 0.5 * verticalAcceleration;
  const radiusSquared = overlapRadius * overlapRadius;
  const constant =
    relativeStartX * relativeStartX +
    relativeStartY * relativeStartY +
    relativeStartZ * relativeStartZ -
    radiusSquared;
  if (constant <= 0) {
    return 0;
  }

  const roots = polynomialRootsInInterval(
    [
      constant,
      2 *
        (relativeStartX * relativeVelocityX +
          relativeStartY * relativeVelocityY +
          relativeStartZ * relativeVelocityZ),
      relativeVelocityX * relativeVelocityX +
        relativeVelocityY * relativeVelocityY +
        relativeVelocityZ * relativeVelocityZ +
        2 *
          (relativeStartX * halfAccelerationX +
            relativeStartY * halfAccelerationY),
      2 *
        (relativeVelocityX * halfAccelerationX +
          relativeVelocityY * halfAccelerationY),
      halfAccelerationX * halfAccelerationX +
        halfAccelerationY * halfAccelerationY,
    ],
    0,
    stepSeconds,
  );
  for (const contactSeconds of roots) {
    const relativeContactX =
      relativeStartX +
      relativeVelocityX * contactSeconds +
      halfAccelerationX * contactSeconds * contactSeconds;
    const relativeContactY =
      relativeStartY +
      relativeVelocityY * contactSeconds +
      halfAccelerationY * contactSeconds * contactSeconds;
    const relativeContactZ =
      relativeStartZ + relativeVelocityZ * contactSeconds;
    const contactVelocityX =
      relativeVelocityX + horizontalAcceleration * contactSeconds;
    const contactVelocityY =
      relativeVelocityY + verticalAcceleration * contactSeconds;
    const radialVelocity =
      relativeContactX * contactVelocityX +
      relativeContactY * contactVelocityY +
      relativeContactZ * relativeVelocityZ;
    if (radialVelocity < 0) {
      return contactSeconds / stepSeconds;
    }
  }
  return NO_CONTACT;
}

function normalizedKeeperContactNormal(
  offsetX: number,
  offsetY: number,
  offsetZ: number,
  relativeVelocityX: number,
  relativeVelocityY: number,
  relativeVelocityZ: number,
): Vec3 {
  const offsetLength = Math.hypot(offsetX, offsetY, offsetZ);
  if (offsetLength > Number.EPSILON) {
    return Object.freeze({
      x: offsetX / offsetLength,
      y: offsetY / offsetLength,
      z: offsetZ / offsetLength,
    });
  }

  const relativeSpeed = Math.hypot(
    relativeVelocityX,
    relativeVelocityY,
    relativeVelocityZ,
  );
  if (relativeSpeed > Number.EPSILON) {
    return Object.freeze({
      x: -relativeVelocityX / relativeSpeed,
      y: -relativeVelocityY / relativeSpeed,
      z: -relativeVelocityZ / relativeSpeed,
    });
  }
  return Object.freeze({ x: 0, y: 0, z: -1 });
}

function copyMutable(value: Vec3): MutableVec3 {
  return { x: value.x, y: value.y, z: value.z };
}

function frozenCopy(value: Vec3): Vec3 {
  return Object.freeze({ x: value.x, y: value.y, z: value.z });
}

function lerpUnclamped(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

/** Earliest outward crossing of the arena interior, in simulated time. */
function playableVolumeExitFraction(
  state: BallFlightState,
  seconds: number,
  radius: number,
): number {
  const volume = state.playableVolume;
  return Math.min(
    outwardCrossingFraction(state.position.x, state.velocity.x,
      state.sideSpinAccelerationMetersPerSecondSquared,
      volume.halfWidthMeters - radius, seconds),
    outwardCrossingFraction(-state.position.x, -state.velocity.x,
      -state.sideSpinAccelerationMetersPerSecondSquared,
      volume.halfWidthMeters - radius, seconds),
    outwardCrossingFraction(state.position.y, state.velocity.y,
      state.gravityMetersPerSecondSquared - state.topSpinDropAccelerationMetersPerSecondSquared,
      volume.ceilingHeightMeters - radius, seconds),
    outwardCrossingFraction(-state.position.z, -state.velocity.z,
      0, -volume.minimumZMeters - radius, seconds),
  );
}

function outwardCrossingFraction(
  position: number, velocity: number, acceleration: number,
  limit: number, seconds: number,
): number {
  if (position > limit) return 0;
  const end = position + velocity * seconds + 0.5 * acceleration * seconds * seconds;
  const apexTime = acceleration < 0 ? -velocity / acceleration : -1;
  const maximum = apexTime > 0 && apexTime < seconds
    ? Math.max(position, end, position + velocity * apexTime + 0.5 * acceleration * apexTime * apexTime)
    : Math.max(position, end);
  // Most fixed steps are far from the arena surfaces: avoid root allocations there.
  if (maximum < limit) return NO_CONTACT;
  for (const time of polynomialRootsInInterval(
    [position - limit, velocity, 0.5 * acceleration], 0, seconds,
  )) {
    if (velocity + acceleration * time > 0) return time / seconds;
  }
  return NO_CONTACT;
}
