import * as THREE from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  STANDARD_GOAL_CONFIG,
  STANDARD_GOALKEEPER_CONFIG,
  STANDARD_RELEASE_POSITION,
  STANDARD_TRAJECTORY_CONFIG,
} from "../../src/config/defaults";
import {
  GOALKEEPER_ZONES,
  goalkeeperZonePosition,
} from "../../src/domain/goalkeeper/zones";
import {
  AUTHORED_BIND_POSE,
  goalkeeperPoseAt,
  SHOOTER_PRESENTATION_YAW_RADIANS,
  shooterPoseAt,
} from "../../src/presentation/characters/CharacterAnimation";
import {
  createCharacterMaterials,
  disposeCharacterMaterials,
  type CharacterMaterials,
} from "../../src/presentation/characters/CharacterMaterials";
import { ProceduralHumanoid } from "../../src/presentation/characters/ProceduralHumanoid";
import { LockedCameraRig } from "../../src/presentation/camera/LockedCameraRig";
import { evaluateStandardTrajectory } from "../../src/domain/shot/trajectory";
import { SeededRng } from "../../src/core/SeededRng";
import { GoalkeeperCommitmentController } from "../../src/domain/goalkeeper/commitment";

const allocatedMaterials: CharacterMaterials[] = [];

afterEach(() => {
  for (const materials of allocatedMaterials.splice(0)) {
    disposeCharacterMaterials(materials);
  }
});

function humanoid(role: "shooter" | "goalkeeper"): ProceduralHumanoid {
  const materials = createCharacterMaterials(role);
  allocatedMaterials.push(materials);
  return new ProceduralHumanoid(role, materials);
}

describe("reusable procedural humanoid", () => {
  it("starts in the authored bind pose with connected finite articulated chains", () => {
    const rig = humanoid("shooter");
    const diagnostics = rig.diagnostics();
    const localBounds = (name: string): THREE.Box3 => {
      const mesh = rig.root.getObjectByName(name);
      if (!(mesh instanceof THREE.Mesh)) {
        throw new Error(`Expected procedural segment ${name}.`);
      }
      mesh.geometry.computeBoundingBox();
      const bounds = mesh.geometry.boundingBox;
      if (bounds === null) {
        throw new Error(`Expected finite local bounds for ${name}.`);
      }
      return bounds.clone().translate(mesh.position);
    };

    expect(AUTHORED_BIND_POSE.name).toBe("authored-bind");
    expect(diagnostics.poseName).toBe(AUTHORED_BIND_POSE.name);
    expect(diagnostics.articulatedJointCount).toBeGreaterThanOrEqual(13);
    expect(diagnostics.finiteTransforms).toBe(true);
    expect(diagnostics.leftHandWorld.x).toBeLessThan(
      diagnostics.rightHandWorld.x,
    );
    expect(diagnostics.leftFootWorld.y).toBeCloseTo(0.08, 1);
    expect(diagnostics.rightFootWorld.y).toBeCloseTo(0.08, 1);
    expect(rig.root.userData["presentationOnly"]).toBe(true);
    expect(rig.root.userData["ownsScoring"]).toBe(false);
    for (const side of ["left", "right"]) {
      for (const segment of ["upper-sleeve", "upper-arm", "forearm"]) {
        const mesh = rig.root.getObjectByName(
          `shooter-${side}-${segment}`,
        ) as THREE.Mesh | undefined;
        expect(mesh).toBeDefined();
        expect(mesh?.geometry.type).toBe("CapsuleGeometry");
      }
      const sleeve = localBounds(`shooter-${side}-upper-sleeve`);
      const upperArm = localBounds(`shooter-${side}-upper-arm`);
      const forearm = localBounds(`shooter-${side}-forearm`);
      expect(sleeve.max.y).toBeGreaterThan(0);
      expect(sleeve.min.y).toBeLessThan(upperArm.max.y);
      expect(upperArm.min.y).toBeLessThan(-0.37);
      expect(forearm.max.y).toBeGreaterThan(0);
      expect(forearm.min.y).toBeLessThan(-0.34);
    }
    rig.dispose();
  });

  it("generates named kit, skin, hair, rubber, and footwear materials", () => {
    const materials = createCharacterMaterials("goalkeeper");
    allocatedMaterials.push(materials);
    const names = Object.values(materials).map((material) => material.name);

    expect(names).toEqual(
      expect.arrayContaining([
        "goalkeeper-woven-kit",
        "goalkeeper-lower-kit",
        "goalkeeper-stylized-skin",
        "goalkeeper-matte-hair",
        "goalkeeper-rubber-sole",
        "goalkeeper-court-footwear",
      ]),
    );
    expect(
      Object.values(materials).every(
        (material) => material.userData["proceduralMaterial"] === true,
      ),
    ).toBe(true);
  });

  it("instances repeated facial, hair, and hand details and disposes their geometry once", () => {
    const rig = humanoid("shooter");
    const repeatedDetails = [
      ["shooter-paired-eyes", 2],
      ["shooter-authored-hair-spikes", 11],
      ["shooter-left-fingers", 4],
      ["shooter-right-fingers", 4],
    ] as const;
    for (const [name, count] of repeatedDetails) {
      const detail = rig.root.getObjectByName(name);
      expect(detail).toBeInstanceOf(THREE.InstancedMesh);
      expect((detail as THREE.InstancedMesh).count).toBe(count);
      expect(detail?.userData["boundedProceduralDetail"]).toBe(true);
    }

    let drawGroups = 0;
    const geometries = new Set<THREE.BufferGeometry>();
    rig.root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        drawGroups += 1;
        geometries.add(object.geometry);
      }
    });
    expect(drawGroups).toBe(30);

    const geometryDispose = vi.spyOn(
      THREE.BufferGeometry.prototype,
      "dispose",
    );
    rig.dispose();
    rig.dispose();
    expect(geometryDispose).toHaveBeenCalledTimes(geometries.size);
    geometryDispose.mockRestore();
  });
});

describe("engine-time and event-driven character poses", () => {
  it("shows a centered HOLD distinct from READ and READY without inventing a destination", () => {
    const keeper = new GoalkeeperCommitmentController(STANDARD_GOALKEEPER_CONFIG, new SeededRng(41));
    const ready = goalkeeperPoseAt(keeper.currentDestination, keeper.currentPhase, 0, 0, null, 0);
    keeper.queueGestureStart();
    keeper.advance(1 / 60);
    const read = goalkeeperPoseAt(keeper.currentDestination, keeper.currentPhase, 0, 0, null, 0);
    for (let step = 0; step < 6; step += 1) keeper.advance(1 / 60);
    expect(keeper.currentPhase).toBe("HOLD");
    expect(keeper.currentDestination).toBeNull();
    const hold = goalkeeperPoseAt(keeper.currentDestination, keeper.currentPhase, 0, 0, null, 0);
    expect(read.pose.leftHand.y).toBeLessThan(ready.pose.leftHand.y);
    expect(hold.pose.leftHand.y).toBeGreaterThan(ready.pose.leftHand.y);
    expect(hold.pose.leftHand.x).toBe(-hold.pose.rightHand.x);
    expect(hold.pose.bodyLeanZ).toBe(0);
    expect(hold.diveAmount).toBe(0);
    keeper.cancelGesture();
    expect(goalkeeperPoseAt(keeper.currentDestination, keeper.currentPhase, 0, 0, null, 0)).toEqual(ready);
  });

  it("keeps the actual committed tell after an opposite cue, without mutating the controller", () => {
    const keeper = new GoalkeeperCommitmentController(STANDARD_GOALKEEPER_CONFIG, new SeededRng(41));
    keeper.queueGestureStart();
    for (let index = 0; index < 2; index += 1) keeper.queueObservation({
      apparentDirection: { x: 1, y: 0 }, elapsedGestureSeconds: 0.04 + index * 0.02,
      confidence: 0.8, feint: null,
    });
    for (let step = 0; step < 6; step += 1) keeper.advance(1 / 60);
    expect(keeper.currentPhase).toBe("COMMIT");
    const before = keeper.diagnostics();
    const first = goalkeeperPoseAt(keeper.currentDestination, keeper.currentPhase, 0, 0, null, 0);
    expect(Math.abs(first.pose.bodyLeanZ)).toBeGreaterThan(0.2);
    // The player's final aim can reverse; presentation continues to use the lock.
    keeper.queueObservation({ apparentDirection: { x: -1, y: 0 }, elapsedGestureSeconds: 0.15, confidence: 1, feint: null });
    keeper.advance(1 / 60);
    expect(keeper.currentDestination).toBe(before.committedDestination);
    expect(goalkeeperPoseAt(keeper.currentDestination, keeper.currentPhase, 0, 0, null, 0)).toEqual(first);
    const locked = keeper.diagnostics();
    for (let frame = 0; frame < 120; frame += 1) {
      goalkeeperPoseAt(keeper.currentDestination, keeper.currentPhase, 0, 0, null, frame / 60);
    }
    expect(keeper.diagnostics()).toEqual(locked);
    expect(keeper.releaseGesture()).toBe(before.committedDestination);
  });

  it.each(GOALKEEPER_ZONES)("preserves %s commitment across release and reaction, then reaches the original full dive", (zone) => {
    const commit = goalkeeperPoseAt(zone, "COMMIT", 0, 0, null, 0);
    const react = goalkeeperPoseAt(zone, "PREPARE", 0, 0, null, 0, true);
    const start = goalkeeperPoseAt(zone, "DIVE", 0, 0, null, 0, true);
    expect(react.pose).toEqual(commit.pose);
    expect(react.reachPoint).toEqual(commit.reachPoint);
    const { name: _name, ...startJoints } = start.pose;
    const { name: _commitName, ...commitJoints } = commit.pose;
    expect(startJoints).toEqual(commitJoints);
    expect(goalkeeperPoseAt(zone, "DIVE", 1, 0, null, 0, true).pose).toEqual(
      goalkeeperPoseAt(zone, "DIVE", 1, 0, null, 0).pose,
    );
    const rig = humanoid("goalkeeper");
    for (let step = 0; step <= 10; step += 1) {
      rig.applyPose(goalkeeperPoseAt(zone, "DIVE", step / 10, 0, null, 0, true).pose);
      expect(rig.diagnostics().finiteTransforms).toBe(true);
      expect(rig.root.position.toArray()).toEqual([0, 0, 0]);
    }
    rig.dispose();
  });

  it("holds the authoritative ready ball at the throwing hand before release", () => {
    const rig = humanoid("shooter");
    rig.root.position.set(-0.78, 0, -0.42);
    rig.root.rotation.y = SHOOTER_PRESENTATION_YAW_RADIANS;
    rig.applyPose(shooterPoseAt("READY", 0, 0, 0).pose);
    const hand = rig.diagnostics().rightHandWorld;
    const distance = Math.hypot(
      hand.x - STANDARD_RELEASE_POSITION.x,
      hand.y - STANDARD_RELEASE_POSITION.y,
      hand.z - STANDARD_RELEASE_POSITION.z,
    );

    expect(distance).toBeLessThanOrEqual(0.2);
    rig.dispose();
  });

  it("moves the shooter through aim, handball release, follow-through, and recovery", () => {
    expect(shooterPoseAt("READY", 0, 0, 0).stage).toBe("IDLE");
    expect(shooterPoseAt("RELEASE", 0.08, 0, 0).stage).toBe("AIM");
    const release = shooterPoseAt("RELEASE", 0.3, 0, 0);
    expect(release.stage).toBe("RELEASE");
    expect(release.releaseAmount).toBeGreaterThan(0);
    expect(release.pose.rightHand.z).toBeGreaterThan(0.35);
    expect(release.pose.rightHand.y).toBeGreaterThan(1.12);
    const follow = shooterPoseAt("RELEASE", 0.72, 0, 0);
    expect(follow.stage).toBe("FOLLOW_THROUGH");
    expect(follow.pose.rightHand.x).toBeGreaterThan(0.85);
    expect(follow.pose.rightHand.z).toBeGreaterThan(0.7);
    expect(follow.pose.rightHand.z - follow.pose.leftHand.z).toBeGreaterThan(
      0.4,
    );
    expect(shooterPoseAt("RECOVER", 1, 0.7, 1).stage).toBe("RECOVERY");
  });

  it("keeps the throwing hand visible beside the real sampled launch path in the hero camera", () => {
    const rig = humanoid("shooter");
    rig.root.position.set(-0.78, 0, -0.42);
    rig.root.rotation.y = SHOOTER_PRESENTATION_YAW_RADIANS;
    rig.applyPose(shooterPoseAt("RELEASE", 12 / 21, 0, 0.2).pose);
    const hand = rig.diagnostics().rightHandWorld;
    const launchSample = evaluateStandardTrajectory(
      STANDARD_RELEASE_POSITION,
      { x: 0.6766198435696688, y: 1.466199933087384, z: 7 },
      3 / 60,
      1,
      STANDARD_TRAJECTORY_CONFIG,
    );
    const camera = new LockedCameraRig();
    camera.resize(1920, 1080);
    const projectedHand = camera.projectPoint(hand);
    const projectedLaunch = camera.projectPoint(launchSample);

    expect(projectedHand.visible).toBe(true);
    expect(projectedHand.x).toBeLessThan(-0.45);
    expect(projectedHand.x).toBeGreaterThan(-1);
    expect(Math.abs(projectedHand.x - projectedLaunch.x)).toBeLessThan(0.2);
    expect(Math.abs(projectedHand.y - projectedLaunch.y)).toBeLessThan(0.3);
    rig.dispose();
  });

  it.each(GOALKEEPER_ZONES)(
    "maps the real %s zone to a distinct dive whose visible reach overlaps the save volume",
    (zone) => {
      const saveCenter = goalkeeperZonePosition(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
      );
      const sample = goalkeeperPoseAt(zone, "HOLD", 1, 0, "SAVED", 0);
      const rig = humanoid("goalkeeper");
      rig.root.position.set(
        saveCenter.x * 0.52,
        Math.max(0, (saveCenter.y - 1) * 0.28),
        saveCenter.z - 0.08,
      );
      rig.applyPose(sample.pose);
      const diagnostics = rig.diagnostics();
      const hand = zone.endsWith("left")
        ? diagnostics.leftHandWorld
        : zone.endsWith("right")
          ? diagnostics.rightHandWorld
          : {
              x:
                (diagnostics.leftHandWorld.x +
                  diagnostics.rightHandWorld.x) /
                2,
              y:
                (diagnostics.leftHandWorld.y +
                  diagnostics.rightHandWorld.y) /
                2,
              z:
                (diagnostics.leftHandWorld.z +
                  diagnostics.rightHandWorld.z) /
                2,
            };
      const distance = Math.hypot(
        hand.x - saveCenter.x,
        hand.y - saveCenter.y,
        hand.z - saveCenter.z,
      );

      expect(sample.pose.name).toBe(`keeper-${zone}-hold`);
      expect(sample.stage).toBe("IMPACT");
      expect(distance).toBeLessThanOrEqual(
        STANDARD_GOALKEEPER_CONFIG.saveRadiusMeters,
      );
      expect(diagnostics.finiteTransforms).toBe(true);
      rig.dispose();
    },
  );

  it("blends continuously from anticipation through dive and impact recovery", () => {
    const anticipation = goalkeeperPoseAt(
      "high-center",
      "PREPARE",
      0,
      0,
      null,
      0,
    );
    const dive = goalkeeperPoseAt(
      "high-center",
      "DIVE",
      0.5,
      0,
      null,
      0,
    );
    const impact = goalkeeperPoseAt(
      "high-center",
      "RETURN",
      1,
      0.1,
      "SAVED",
      0,
    );
    const recovery = goalkeeperPoseAt(
      "high-center",
      "RETURN",
      0.2,
      0.8,
      "SAVED",
      0,
    );

    expect(anticipation.stage).toBe("ANTICIPATION");
    expect(dive.stage).toBe("DIVE");
    expect(dive.diveAmount).toBeGreaterThanOrEqual(0.75);
    expect(dive.pose.leftHand.y).toBeGreaterThan(1.25);
    expect(dive.pose.rightHand.y).toBeGreaterThan(1.25);
    expect(
      dive.pose.rightHand.x - dive.pose.leftHand.x,
    ).toBeGreaterThan(0.7);
    expect(impact.stage).toBe("IMPACT");
    expect(recovery.stage).toBe("RECOVERY");
    expect(recovery.diveAmount).toBeLessThan(impact.diveAmount);
  });

  it("makes an early gameplay-linked dive readable without changing its authoritative progress", () => {
    const early = goalkeeperPoseAt(
      "mid-center",
      "DIVE",
      1 / 6,
      0,
      null,
      0,
    );

    expect(early.diveAmount).toBeGreaterThan(0.42);
    expect(early.diveAmount).toBeLessThan(0.43);
    expect(early.pose.bodyLeanZ).toBeGreaterThan(0.08);
    expect(early.pose.rightHand.x - early.pose.leftHand.x).toBeGreaterThan(
      1.1,
    );
  });
});

it("keeps the actual held ball visible during fake and ready recovery in every approved landscape camera",()=>{
  const rig=humanoid("shooter");
  rig.root.position.set(-0.78,0,-0.42);rig.root.rotation.y=SHOOTER_PRESENTATION_YAW_RADIANS;
  const camera=new LockedCameraRig();
  for(const [width,height] of [[960,540],[1440,900],[1920,1080],[844,390]]) {
    camera.resize(width!,height!);
    for(const direction of [-1,1])for(const amount of [0,.25,.5,1]) {
      const sample=shooterPoseAt("FEINT",0,0,.2,direction,amount);
      rig.applyPose(sample.pose);const hand=rig.throwingHandWorld();
      const point=camera.projectPoint(hand);
      expect(point.visible,JSON.stringify({width,height,direction,amount,hand,point})).toBe(true);
      expect(Math.abs(point.x)).toBeLessThan(.95);
      expect(sample.releaseAmount).toBe(0);
    }
  }
  rig.dispose();
});
