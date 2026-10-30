import type { GoalkeeperZone } from "../../domain/goalkeeper/zones";
import type { ShotOutcome } from "../../domain/shot/outcome";

export type ShooterAnimationStage =
  | "FEINT"
  | "IDLE"
  | "AIM"
  | "RELEASE"
  | "FOLLOW_THROUGH"
  | "RECOVERY";

export type GoalkeeperAnimationStage =
  | "READY"
  | "ANTICIPATION"
  | "DIVE"
  | "IMPACT"
  | "RECOVERY";

export interface PosePoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface HumanoidPose {
  readonly name: string;
  readonly bodyLeanX: number;
  readonly bodyLeanZ: number;
  readonly bodyTwistY: number;
  readonly headYaw: number;
  readonly leftHand: PosePoint;
  readonly rightHand: PosePoint;
  readonly leftElbowPole: PosePoint;
  readonly rightElbowPole: PosePoint;
  readonly leftFoot: PosePoint;
  readonly rightFoot: PosePoint;
  readonly leftKneePole: PosePoint;
  readonly rightKneePole: PosePoint;
  readonly handSpread: number;
}

export interface ShooterPoseSample {
  readonly stage: ShooterAnimationStage;
  readonly releaseAmount: number;
  readonly pose: HumanoidPose;
}

export interface GoalkeeperPoseSample {
  readonly stage: GoalkeeperAnimationStage;
  readonly diveAmount: number;
  readonly pose: HumanoidPose;
  readonly reachPoint: PosePoint;
}

// The locked camera sits over the shooter's left shoulder. Turning the
// presentation rig into that camera keeps the throwing arm visible as it
// follows the authoritative release point toward the goal.
export const SHOOTER_PRESENTATION_YAW_RADIANS = -0.3;

export const AUTHORED_BIND_POSE: HumanoidPose = Object.freeze({
  name: "authored-bind",
  bodyLeanX: 0,
  bodyLeanZ: 0,
  bodyTwistY: 0,
  headYaw: 0,
  leftHand: Object.freeze({ x: -0.35, y: 0.98, z: 0.02 }),
  rightHand: Object.freeze({ x: 0.35, y: 0.98, z: 0.02 }),
  leftElbowPole: Object.freeze({ x: -0.58, y: 1.18, z: 0.12 }),
  rightElbowPole: Object.freeze({ x: 0.58, y: 1.18, z: 0.12 }),
  leftFoot: Object.freeze({ x: -0.17, y: 0.08, z: 0.04 }),
  rightFoot: Object.freeze({ x: 0.17, y: 0.08, z: 0.04 }),
  leftKneePole: Object.freeze({ x: -0.22, y: 0.46, z: 0.2 }),
  rightKneePole: Object.freeze({ x: 0.22, y: 0.46, z: 0.2 }),
  handSpread: 0.08,
});

const SHOOTER_AIM_POSE: HumanoidPose = Object.freeze({
  name: "shooter-aim",
  bodyLeanX: 0.08,
  bodyLeanZ: -0.1,
  bodyTwistY: -0.25,
  headYaw: 0.2,
  leftHand: Object.freeze({ x: -0.36, y: 1.2, z: 0.24 }),
  rightHand: Object.freeze({ x: 0.87, y: 1.12, z: 0.17 }),
  leftElbowPole: Object.freeze({ x: -0.58, y: 1.38, z: 0.22 }),
  rightElbowPole: Object.freeze({ x: 0.82, y: 1.52, z: -0.02 }),
  leftFoot: Object.freeze({ x: -0.25, y: 0.08, z: 0.18 }),
  rightFoot: Object.freeze({ x: 0.28, y: 0.08, z: -0.2 }),
  leftKneePole: Object.freeze({ x: -0.32, y: 0.45, z: 0.4 }),
  rightKneePole: Object.freeze({ x: 0.36, y: 0.48, z: 0.05 }),
  handSpread: 0.1,
});

const SHOOTER_RELEASE_POSE: HumanoidPose = Object.freeze({
  name: "shooter-release",
  bodyLeanX: 0.2,
  bodyLeanZ: 0.08,
  bodyTwistY: 0.22,
  headYaw: -0.12,
  leftHand: Object.freeze({ x: -0.4, y: 1.3, z: 0.3 }),
  rightHand: Object.freeze({ x: 0.9, y: 1.62, z: 0.66 }),
  leftElbowPole: Object.freeze({ x: -0.62, y: 1.42, z: 0.28 }),
  rightElbowPole: Object.freeze({ x: 0.56, y: 1.82, z: 0.48 }),
  leftFoot: Object.freeze({ x: -0.27, y: 0.08, z: 0.24 }),
  rightFoot: Object.freeze({ x: 0.29, y: 0.08, z: -0.12 }),
  leftKneePole: Object.freeze({ x: -0.34, y: 0.44, z: 0.45 }),
  rightKneePole: Object.freeze({ x: 0.37, y: 0.48, z: 0.08 }),
  handSpread: 0.16,
});

const SHOOTER_FOLLOW_POSE: HumanoidPose = Object.freeze({
  name: "shooter-follow-through",
  bodyLeanX: 0.3,
  bodyLeanZ: 0.14,
  bodyTwistY: 0.38,
  headYaw: -0.16,
  leftHand: Object.freeze({ x: -0.38, y: 1.28, z: 0.3 }),
  rightHand: Object.freeze({ x: 0.9, y: 1.5, z: 0.78 }),
  leftElbowPole: Object.freeze({ x: -0.58, y: 1.38, z: 0.3 }),
  rightElbowPole: Object.freeze({ x: 0.52, y: 1.7, z: 0.64 }),
  leftFoot: Object.freeze({ x: -0.28, y: 0.08, z: 0.27 }),
  rightFoot: Object.freeze({ x: 0.27, y: 0.08, z: -0.05 }),
  leftKneePole: Object.freeze({ x: -0.34, y: 0.42, z: 0.48 }),
  rightKneePole: Object.freeze({ x: 0.34, y: 0.45, z: 0.14 }),
  handSpread: 0.2,
});

const KEEPER_READY_POSE: HumanoidPose = Object.freeze({
  name: "keeper-ready",
  bodyLeanX: 0.08,
  bodyLeanZ: 0,
  bodyTwistY: 0,
  headYaw: 0,
  leftHand: Object.freeze({ x: -0.48, y: 1.28, z: 0.2 }),
  rightHand: Object.freeze({ x: 0.48, y: 1.28, z: 0.2 }),
  leftElbowPole: Object.freeze({ x: -0.68, y: 1.2, z: 0.14 }),
  rightElbowPole: Object.freeze({ x: 0.68, y: 1.2, z: 0.14 }),
  leftFoot: Object.freeze({ x: -0.25, y: 0.08, z: 0.12 }),
  rightFoot: Object.freeze({ x: 0.25, y: 0.08, z: 0.12 }),
  leftKneePole: Object.freeze({ x: -0.31, y: 0.43, z: 0.37 }),
  rightKneePole: Object.freeze({ x: 0.31, y: 0.43, z: 0.37 }),
  handSpread: 0.16,
});

const KEEPER_ANTICIPATION_POSE: HumanoidPose = Object.freeze({
  name: "keeper-anticipation",
  bodyLeanX: 0.18,
  bodyLeanZ: 0,
  bodyTwistY: 0,
  headYaw: 0,
  leftHand: Object.freeze({ x: -0.56, y: 1.1, z: 0.28 }),
  rightHand: Object.freeze({ x: 0.56, y: 1.1, z: 0.28 }),
  leftElbowPole: Object.freeze({ x: -0.72, y: 1.08, z: 0.18 }),
  rightElbowPole: Object.freeze({ x: 0.72, y: 1.08, z: 0.18 }),
  leftFoot: Object.freeze({ x: -0.3, y: 0.08, z: 0.15 }),
  rightFoot: Object.freeze({ x: 0.3, y: 0.08, z: 0.15 }),
  leftKneePole: Object.freeze({ x: -0.38, y: 0.38, z: 0.48 }),
  rightKneePole: Object.freeze({ x: 0.38, y: 0.38, z: 0.48 }),
  handSpread: 0.2,
});

// A centered guard communicates that the keeper is waiting, rather than leaning
// toward an uncommitted observation. This is presentation, never a save volume.
const KEEPER_WAIT_POSE: HumanoidPose = Object.freeze({
  ...KEEPER_ANTICIPATION_POSE,
  name: "keeper-hold",
  bodyLeanX: 0.12,
  leftHand: Object.freeze({ x: -0.64, y: 1.4, z: 0.24 }),
  rightHand: Object.freeze({ x: 0.64, y: 1.4, z: 0.24 }),
  leftElbowPole: Object.freeze({ x: -0.76, y: 1.22, z: 0.18 }),
  rightElbowPole: Object.freeze({ x: 0.76, y: 1.22, z: 0.18 }),
});

const KEEPER_COMMIT_AMOUNT = 0.42;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smooth(value: number): number {
  const amount = clamp01(value);
  return amount * amount * (3 - 2 * amount);
}

function readableDiveAmount(value: number): number {
  const amount = clamp01(value);
  return 1 - (1 - amount) * (1 - amount) * (1 - amount);
}

function mixNumber(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

function mixPoint(from: PosePoint, to: PosePoint, amount: number): PosePoint {
  return Object.freeze({
    x: mixNumber(from.x, to.x, amount),
    y: mixNumber(from.y, to.y, amount),
    z: mixNumber(from.z, to.z, amount),
  });
}

function mixPose(
  from: HumanoidPose,
  to: HumanoidPose,
  amount: number,
  name: string,
): HumanoidPose {
  const blend = smooth(amount);
  return Object.freeze({
    name,
    bodyLeanX: mixNumber(from.bodyLeanX, to.bodyLeanX, blend),
    bodyLeanZ: mixNumber(from.bodyLeanZ, to.bodyLeanZ, blend),
    bodyTwistY: mixNumber(from.bodyTwistY, to.bodyTwistY, blend),
    headYaw: mixNumber(from.headYaw, to.headYaw, blend),
    leftHand: mixPoint(from.leftHand, to.leftHand, blend),
    rightHand: mixPoint(from.rightHand, to.rightHand, blend),
    leftElbowPole: mixPoint(from.leftElbowPole, to.leftElbowPole, blend),
    rightElbowPole: mixPoint(from.rightElbowPole, to.rightElbowPole, blend),
    leftFoot: mixPoint(from.leftFoot, to.leftFoot, blend),
    rightFoot: mixPoint(from.rightFoot, to.rightFoot, blend),
    leftKneePole: mixPoint(from.leftKneePole, to.leftKneePole, blend),
    rightKneePole: mixPoint(from.rightKneePole, to.rightKneePole, blend),
    handSpread: mixNumber(from.handSpread, to.handSpread, blend),
  });
}

function shooterIdlePose(simulationSeconds: number): HumanoidPose {
  const breath = Math.sin(simulationSeconds * 2.4);
  return Object.freeze({
    ...SHOOTER_AIM_POSE,
    name: "shooter-idle-aim",
    bodyLeanX: SHOOTER_AIM_POSE.bodyLeanX + breath * 0.012,
    rightHand: Object.freeze({
      ...SHOOTER_AIM_POSE.rightHand,
      y: SHOOTER_AIM_POSE.rightHand.y + breath * 0.018,
    }),
  });
}

export function shooterPoseAt(
  phase: "READY" | "FEINT" | "RELEASE" | "RECOVER",
  shotProgress: number,
  resultProgress: number,
  simulationSeconds: number,
  feintDirection = 0,
  feintAmount = 0,
  category: "DIRECT" | "LOB" | "BOUNCE" = "DIRECT",
  sideSpin = 0,
): ShooterPoseSample {
  if (phase === "FEINT") {
    const amount = clamp01(feintAmount);
    const base = shooterIdlePose(simulationSeconds);
    return { stage: amount > 0 ? "FEINT" : "IDLE", releaseAmount: 0, pose: {
      ...base, name: amount > 0 ? "shooter-feint-held" : "shooter-feint-ready",
      bodyTwistY: base.bodyTwistY + feintDirection * amount * 0.22,
      bodyLeanZ: base.bodyLeanZ - feintDirection * amount * 0.07,
      // Cocked holding position stays inside the existing landscape camera.
      rightHand: { x: 0.55 + feintDirection * amount * 0.09,
        y: 1.5 + amount * 0.18, z: 0.65 + amount * 0.1 },
      rightElbowPole: { ...base.rightElbowPole, y: base.rightElbowPole.y + amount * 0.2 },
    } };
  }
  if (phase === "RELEASE" && (category !== "DIRECT" || Math.abs(sideSpin) > 0.05)) {
    const sample = shooterPoseAt(phase, shotProgress, resultProgress, simulationSeconds);
    const lift = category === "LOB" ? 0.28 : category === "BOUNCE" ? -0.22 : 0;
    return { ...sample, pose: { ...sample.pose,
      name: `shooter-${category.toLowerCase()}-${Math.abs(sideSpin) > 0.05 ? "rosca" : sample.stage.toLowerCase()}`,
      bodyTwistY: sample.pose.bodyTwistY + sideSpin * 0.22,
      rightHand: { ...sample.pose.rightHand, y: sample.pose.rightHand.y + lift,
        x: sample.pose.rightHand.x + sideSpin * 0.18 },
      rightElbowPole: { ...sample.pose.rightElbowPole, y: sample.pose.rightElbowPole.y + lift },
      handSpread: sample.pose.handSpread + Math.abs(sideSpin) * 0.1,
    } };
  }
  if (phase === "READY") {
    return Object.freeze({
      stage: "IDLE",
      releaseAmount: 0,
      pose: shooterIdlePose(simulationSeconds),
    });
  }
  if (phase === "RECOVER") {
    const recovery = smooth(resultProgress);
    return Object.freeze({
      stage: "RECOVERY",
      releaseAmount: 1 - recovery,
      pose: mixPose(
        SHOOTER_FOLLOW_POSE,
        shooterIdlePose(simulationSeconds),
        recovery,
        "shooter-recovery",
      ),
    });
  }

  const progress = clamp01(shotProgress);
  if (progress < 0.16) {
    return Object.freeze({
      stage: "AIM",
      releaseAmount: progress / 0.42,
      pose: mixPose(
        shooterIdlePose(simulationSeconds),
        SHOOTER_AIM_POSE,
        progress / 0.16,
        "shooter-cocked-aim",
      ),
    });
  }
  if (progress < 0.42) {
    const release = (progress - 0.16) / 0.26;
    return Object.freeze({
      stage: "RELEASE",
      releaseAmount: smooth(release),
      pose: mixPose(
        SHOOTER_AIM_POSE,
        SHOOTER_RELEASE_POSE,
        release,
        "shooter-handball-release",
      ),
    });
  }
  const follow = (progress - 0.42) / 0.58;
  return Object.freeze({
    stage: "FOLLOW_THROUGH",
    releaseAmount: 1,
    pose: mixPose(
      SHOOTER_RELEASE_POSE,
      SHOOTER_FOLLOW_POSE,
      follow,
      "shooter-follow-through",
    ),
  });
}

function zoneFactors(zone: GoalkeeperZone | null): Readonly<{
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}> {
  if (zone === null) {
    return Object.freeze({ x: 0, y: 0 });
  }
  return Object.freeze({
    x: zone.endsWith("left") ? -1 : zone.endsWith("right") ? 1 : 0,
    y: zone.startsWith("low") ? -1 : zone.startsWith("high") ? 1 : 0,
  });
}

function goalkeeperDivePose(zone: GoalkeeperZone): Readonly<{
  pose: HumanoidPose;
  reachPoint: PosePoint;
}> {
  const factor = zoneFactors(zone);
  const targetY = factor.y < 0 ? 0.24 : factor.y > 0 ? 1.82 : 1.08;
  const sideReach = 0.86;
  const centerSpread = factor.y > 0 ? 0.7 : 0.78;
  const centerDiveBias =
    factor.x === 0
      ? factor.y > 0
        ? -0.32
        : factor.y === 0
          ? 0.24
          : 0.12
      : 0;
  const leftHand = Object.freeze({
    x: factor.x < 0 ? -sideReach : factor.x > 0 ? 0.38 : -centerSpread,
    y: targetY + (factor.x < 0 ? 0.02 : -0.02),
    z: 0.18,
  });
  const rightHand = Object.freeze({
    x: factor.x > 0 ? sideReach : factor.x < 0 ? -0.38 : centerSpread,
    y: targetY + (factor.x > 0 ? 0.02 : -0.02),
    z: 0.18,
  });
  const reachPoint =
    factor.x < 0
      ? leftHand
      : factor.x > 0
        ? rightHand
        : Object.freeze({
            x: 0,
            y: (leftHand.y + rightHand.y) / 2,
            z: (leftHand.z + rightHand.z) / 2,
          });
  const pose: HumanoidPose = Object.freeze({
    name: `keeper-${zone}-dive`,
    bodyLeanX: factor.y > 0 ? -0.16 : 0.1,
    bodyLeanZ: factor.x * -0.88 + centerDiveBias,
    bodyTwistY: factor.x * 0.2,
    headYaw: factor.x * 0.16,
    leftHand,
    rightHand,
    leftElbowPole: Object.freeze({
      x: leftHand.x - 0.18,
      y: targetY - 0.12,
      z: 0.32,
    }),
    rightElbowPole: Object.freeze({
      x: rightHand.x + 0.18,
      y: targetY - 0.12,
      z: 0.32,
    }),
    leftFoot: Object.freeze({
      x: factor.x > 0 ? -0.54 : factor.x < 0 ? -0.28 : -0.5,
      y: factor.y > 0 ? 0.4 : 0.08,
      z: factor.y < 0 ? 0.34 : -0.08,
    }),
    rightFoot: Object.freeze({
      x: factor.x < 0 ? 0.54 : factor.x > 0 ? 0.28 : 0.5,
      y: factor.y > 0 ? 0.4 : 0.08,
      z: factor.y < 0 ? 0.34 : -0.08,
    }),
    leftKneePole: Object.freeze({
      x: -0.42,
      y: 0.42,
      z: 0.4,
    }),
    rightKneePole: Object.freeze({
      x: 0.42,
      y: 0.42,
      z: 0.4,
    }),
    handSpread: 0.36,
  });
  return Object.freeze({ pose, reachPoint });
}

export function goalkeeperPoseAt(
  zone: GoalkeeperZone | null,
  phase:
    | "READY"
    | "READ"
    | "COMMIT"
    | "PREPARE"
    | "DIVE"
    | "HOLD"
    | "RETURN"
    | "RECOVER",
  diveProgress: number,
  resultProgress: number,
  outcome: ShotOutcome | null,
  simulationSeconds: number,
  committed = false,
): GoalkeeperPoseSample {
  const readyBreath = Math.sin(simulationSeconds * 3) * 0.012;
  const readyPose: HumanoidPose = Object.freeze({
    ...KEEPER_READY_POSE,
    bodyLeanX: KEEPER_READY_POSE.bodyLeanX + readyBreath,
  });
  if (phase === "READ") {
    return Object.freeze({
      stage: "ANTICIPATION",
      diveAmount: 0,
      pose: KEEPER_ANTICIPATION_POSE,
      reachPoint: Object.freeze({ x: 0, y: 1.1, z: 0.28 }),
    });
  }
  if (phase === "HOLD" && zone === null) {
    return Object.freeze({
      stage: "ANTICIPATION",
      diveAmount: 0,
      pose: KEEPER_WAIT_POSE,
      reachPoint: Object.freeze({ x: 0, y: 1.4, z: 0.24 }),
    });
  }
  if (zone === null || phase === "READY") {
    return Object.freeze({
      stage: "READY",
      diveAmount: 0,
      pose: readyPose,
      reachPoint: Object.freeze({ x: 0, y: 1.28, z: 0.2 }),
    });
  }

  const dive = goalkeeperDivePose(zone);
  // The zone is the controller's locked destination. No eventual shot target or
  // gesture prediction enters this sampler. Keep the tell through reaction delay
  // and blend from it into the existing dive, so release cannot erase deception.
  const showsCommitment = committed || phase === "COMMIT" || phase === "RECOVER";
  const commitmentPose = showsCommitment ? mixPose(
    KEEPER_ANTICIPATION_POSE,
    dive.pose,
    KEEPER_COMMIT_AMOUNT,
    `keeper-${zone}-commit`,
  ) : KEEPER_ANTICIPATION_POSE;
  const commitmentReach = showsCommitment ? mixPoint(
    { x: 0, y: 1.1, z: 0.28 },
    dive.reachPoint,
    smooth(KEEPER_COMMIT_AMOUNT),
  ) : { x: 0, y: 1.1, z: 0.28 };
  if (phase === "COMMIT" || (phase === "PREPARE" && committed)) {
    return Object.freeze({
      stage: "ANTICIPATION",
      diveAmount: KEEPER_COMMIT_AMOUNT,
      pose: commitmentPose,
      reachPoint: commitmentReach,
    });
  }
  if (phase === "PREPARE") {
    return Object.freeze({
      stage: "ANTICIPATION",
      diveAmount: 0,
      pose: KEEPER_ANTICIPATION_POSE,
      reachPoint: Object.freeze({ x: 0, y: 1.1, z: 0.28 }),
    });
  }
  if (phase === "RECOVER") {
    return { stage: "RECOVERY", diveAmount: KEEPER_COMMIT_AMOUNT * (1 - smooth(resultProgress)),
      pose: mixPose(commitmentPose, readyPose, resultProgress, "keeper-feint-recovery"),
      reachPoint: mixPoint(commitmentReach, { x: 0, y: 1.28, z: 0.2 }, smooth(resultProgress)) };
  }
  if (phase === "RETURN") {
    const recovery = smooth(resultProgress);
    const impact = outcome === "SAVED" && recovery < 0.22;
    return Object.freeze({
      stage: impact ? "IMPACT" : "RECOVERY",
      diveAmount: 1 - recovery,
      pose: mixPose(
        dive.pose,
        readyPose,
        recovery,
        impact ? `keeper-${zone}-impact` : `keeper-${zone}-recovery`,
      ),
      reachPoint: mixPoint(
        dive.reachPoint,
        { x: 0, y: 1.28, z: 0.2 },
        recovery,
      ),
    });
  }

  const amount =
    phase === "HOLD" ? 1 : readableDiveAmount(diveProgress);
  return Object.freeze({
    stage: phase === "HOLD" && outcome === "SAVED" ? "IMPACT" : "DIVE",
    diveAmount: amount,
    pose: mixPose(
      committed && amount < 1 ? commitmentPose : KEEPER_ANTICIPATION_POSE,
      dive.pose,
      amount,
      `keeper-${zone}-${phase.toLowerCase()}`,
    ),
    reachPoint: mixPoint(
      committed && amount < 1 ? commitmentReach : { x: 0, y: 1.1, z: 0.28 },
      dive.reachPoint,
      amount,
    ),
  });
}
