import * as THREE from "three";
import type {
  CharacterMaterials,
  CharacterRole,
} from "./CharacterMaterials";
import {
  AUTHORED_BIND_POSE,
  type HumanoidPose,
  type PosePoint,
} from "./CharacterAnimation";

type Side = "left" | "right";

interface TwoBoneChain {
  readonly upperJoint: THREE.Group;
  readonly lowerJoint: THREE.Group;
  readonly endJoint: THREE.Group;
  readonly upperLength: number;
  readonly lowerLength: number;
}

export interface ProceduralHumanoidDiagnostics {
  readonly role: CharacterRole;
  readonly poseName: string;
  readonly articulatedJointCount: number;
  readonly finiteTransforms: boolean;
  readonly leftHandWorld: Readonly<PosePoint>;
  readonly rightHandWorld: Readonly<PosePoint>;
  readonly leftFootWorld: Readonly<PosePoint>;
  readonly rightFootWorld: Readonly<PosePoint>;
}

const DOWN = new THREE.Vector3(0, -1, 0);
const EPSILON = 0.0001;

export class ProceduralHumanoid {
  public readonly root = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly headJoint = new THREE.Group();
  private readonly leftArm: TwoBoneChain;
  private readonly rightArm: TwoBoneChain;
  private readonly leftLeg: TwoBoneChain;
  private readonly rightLeg: TwoBoneChain;
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly joints: THREE.Group[] = [];
  private poseName = AUTHORED_BIND_POSE.name;
  private disposed = false;

  public constructor(
    private readonly role: CharacterRole,
    private readonly materials: CharacterMaterials,
  ) {
    this.root.name = role === "shooter"
      ? "ProceduralShooterVisualRoot"
      : "ProceduralGoalkeeperVisualRoot";
    this.root.userData["presentationOnly"] = true;
    this.root.userData["ownsScoring"] = false;
    this.body.name = `${role}-body-control`;
    this.root.add(this.body);
    this.buildTorsoAndHead();
    this.leftArm = this.buildArm("left");
    this.rightArm = this.buildArm("right");
    this.leftLeg = this.buildLeg("left");
    this.rightLeg = this.buildLeg("right");
    this.applyBindPose();
  }

  public applyBindPose(): void {
    this.applyPose(AUTHORED_BIND_POSE);
  }

  public applyPose(pose: HumanoidPose): void {
    this.poseName = pose.name;
    this.body.rotation.set(
      pose.bodyLeanX,
      pose.bodyTwistY,
      pose.bodyLeanZ,
    );
    this.headJoint.rotation.set(0, pose.headYaw, -pose.bodyLeanZ * 0.18);
    this.root.updateMatrixWorld(true);

    this.solveChain(
      this.leftArm,
      pose.leftHand,
      pose.leftElbowPole,
    );
    this.solveChain(
      this.rightArm,
      pose.rightHand,
      pose.rightElbowPole,
    );
    this.solveChain(
      this.leftLeg,
      pose.leftFoot,
      pose.leftKneePole,
    );
    this.solveChain(
      this.rightLeg,
      pose.rightFoot,
      pose.rightKneePole,
    );

    this.leftArm.endJoint.rotation.z = -pose.handSpread;
    this.rightArm.endJoint.rotation.z = pose.handSpread;
    this.leftLeg.endJoint.rotation.x = Math.PI / 2 - 0.16;
    this.rightLeg.endJoint.rotation.x = Math.PI / 2 - 0.16;
    this.root.updateMatrixWorld(true);
  }

  public throwingHandWorld(): PosePoint {
    return this.worldPoint(this.rightArm.endJoint);
  }

  public diagnostics(): ProceduralHumanoidDiagnostics {
    let finiteTransforms = true;
    this.root.traverse((object) => {
      const values = [
        object.position.x,
        object.position.y,
        object.position.z,
        object.quaternion.x,
        object.quaternion.y,
        object.quaternion.z,
        object.quaternion.w,
        object.scale.x,
        object.scale.y,
        object.scale.z,
      ];
      if (values.some((value) => !Number.isFinite(value))) {
        finiteTransforms = false;
      }
    });
    return Object.freeze({
      role: this.role,
      poseName: this.poseName,
      articulatedJointCount: this.joints.length,
      finiteTransforms,
      leftHandWorld: this.worldPoint(this.leftArm.endJoint),
      rightHandWorld: this.worldPoint(this.rightArm.endJoint),
      leftFootWorld: this.worldPoint(this.leftLeg.endJoint),
      rightFootWorld: this.worldPoint(this.rightLeg.endJoint),
    });
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    for (const geometry of this.geometries) {
      geometry.dispose();
    }
  }

  private buildTorsoAndHead(): void {
    const pelvis = this.mesh(
      new THREE.SphereGeometry(0.25, 12, 8),
      this.materials.lowerKit,
      "pelvis",
    );
    pelvis.scale.set(1, 0.72, 0.72);
    pelvis.position.y = 0.86;
    this.body.add(pelvis);

    const waist = this.mesh(
      new THREE.CylinderGeometry(0.22, 0.24, 0.25, 12),
      this.materials.lowerKit,
      "waist",
    );
    waist.position.y = 1.02;
    this.body.add(waist);

    const torso = this.mesh(
      new THREE.CylinderGeometry(0.25, 0.33, 0.62, 12),
      this.materials.kit,
      "tapered-jersey",
    );
    torso.position.y = 1.3;
    torso.scale.z = 0.72;
    this.body.add(torso);

    const shoulderBand = this.mesh(
      new THREE.CapsuleGeometry(0.08, 0.43, 5, 10),
      this.materials.kitAccent,
      "shoulder-band",
    );
    shoulderBand.rotation.z = Math.PI / 2;
    shoulderBand.position.set(0, 1.53, 0);
    shoulderBand.scale.z = 0.72;
    this.body.add(shoulderBand);

    const collar = this.mesh(
      new THREE.TorusGeometry(0.105, 0.025, 6, 16),
      this.materials.kitAccent,
      "jersey-collar",
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 1.58, 0);
    this.body.add(collar);

    const neck = this.mesh(
      new THREE.CylinderGeometry(0.085, 0.095, 0.14, 10),
      this.materials.skin,
      "neck",
    );
    neck.position.y = 1.65;
    this.body.add(neck);

    this.headJoint.name = `${this.role}-neck-joint`;
    this.headJoint.position.y = 1.72;
    this.joints.push(this.headJoint);
    this.body.add(this.headJoint);

    const head = this.mesh(
      new THREE.SphereGeometry(0.18, 14, 10),
      this.materials.skin,
      "head",
    );
    head.scale.set(0.92, 1.08, 0.92);
    head.position.y = 0.08;
    this.headJoint.add(head);

    const faceZ = this.role === "shooter" ? 0.165 : -0.165;
    const eyeGeometry = new THREE.SphereGeometry(0.018, 8, 5);
    const eyes = this.instancedMesh(
      eyeGeometry,
      this.materials.eye,
      "paired-eyes",
      2,
    );
    const detailTransform = new THREE.Matrix4();
    for (const [index, x] of [-0.055, 0.055].entries()) {
      detailTransform.makeTranslation(x, 0.11, faceZ);
      eyes.setMatrixAt(index, detailTransform);
    }
    this.finalizeInstancedMesh(eyes);
    this.headJoint.add(eyes);

    const hairCap = this.mesh(
      new THREE.SphereGeometry(0.19, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58),
      this.materials.hair,
      "hair-cap",
    );
    hairCap.scale.set(1.04, 0.9, 1.04);
    hairCap.position.y = 0.115;
    this.headJoint.add(hairCap);
    this.addHairSilhouette();
  }

  private addHairSilhouette(): void {
    const spikeCount = this.role === "shooter" ? 11 : 5;
    const spikeGeometry = new THREE.ConeGeometry(0.045, 1, 6);
    const spikes = this.instancedMesh(
      spikeGeometry,
      this.materials.hair,
      "authored-hair-spikes",
      spikeCount,
    );
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const transform = new THREE.Matrix4();
    for (let index = 0; index < spikeCount; index += 1) {
      const angle = (index / spikeCount) * Math.PI * 2;
      const length =
        this.role === "shooter"
          ? 0.12 + (index % 3) * 0.025
          : 0.075 + (index % 2) * 0.015;
      position.set(
        Math.cos(angle) * 0.15,
        0.18 + (index % 2) * 0.025,
        Math.sin(angle) * 0.15,
      );
      rotation.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(
          Math.cos(angle) * 0.62,
          0.78,
          Math.sin(angle) * 0.62,
        ).normalize(),
      );
      scale.set(1, length, 1);
      transform.compose(position, rotation, scale);
      spikes.setMatrixAt(index, transform);
    }
    this.finalizeInstancedMesh(spikes);
    this.headJoint.add(spikes);
  }

  private buildArm(side: Side): TwoBoneChain {
    const sign = side === "left" ? -1 : 1;
    const upperLength = this.role === "shooter" ? 0.37 : 0.39;
    const lowerLength = this.role === "shooter" ? 0.34 : 0.36;
    const upperJoint = this.joint(`${this.role}-${side}-shoulder`);
    upperJoint.position.set(sign * 0.29, 1.49, 0);
    this.body.add(upperJoint);

    // Rounded arm segments overlap each animated joint. This keeps the
    // shoulder-to-hand silhouette connected without adding a separate draw
    // group for every shoulder, elbow, and wrist.
    const sleeve = this.armSegment(
      upperLength * 0.42,
      0.082,
      0.045,
      0.02,
      this.materials.kit,
      `${side}-upper-sleeve`,
    );
    upperJoint.add(sleeve);
    const upperSkin = this.armSegment(
      upperLength * 0.58,
      0.062,
      0.02,
      0.035,
      this.materials.skin,
      `${side}-upper-arm`,
    );
    upperSkin.position.y -= upperLength * 0.42;
    upperJoint.add(upperSkin);

    const lowerJoint = this.joint(`${this.role}-${side}-elbow`);
    lowerJoint.position.y = -upperLength;
    upperJoint.add(lowerJoint);
    const forearm = this.armSegment(
      lowerLength,
      0.055,
      0.035,
      0.025,
      this.materials.skin,
      `${side}-forearm`,
    );
    lowerJoint.add(forearm);

    const endJoint = this.joint(`${this.role}-${side}-wrist`);
    endJoint.position.y = -lowerLength;
    lowerJoint.add(endJoint);
    this.addHand(endJoint, side);
    return {
      upperJoint,
      lowerJoint,
      endJoint,
      upperLength,
      lowerLength,
    };
  }

  private buildLeg(side: Side): TwoBoneChain {
    const sign = side === "left" ? -1 : 1;
    const upperLength = 0.43;
    const lowerLength = 0.42;
    const upperJoint = this.joint(`${this.role}-${side}-hip`);
    upperJoint.position.set(sign * 0.13, 0.88, 0);
    this.body.add(upperJoint);
    const thigh = this.segment(
      upperLength,
      0.105,
      0.082,
      this.materials.lowerKit,
      `${side}-thigh`,
    );
    upperJoint.add(thigh);

    const lowerJoint = this.joint(`${this.role}-${side}-knee`);
    lowerJoint.position.y = -upperLength;
    upperJoint.add(lowerJoint);
    const shin = this.segment(
      lowerLength,
      0.078,
      0.052,
      this.materials.lowerKit,
      `${side}-shin`,
    );
    lowerJoint.add(shin);

    const endJoint = this.joint(`${this.role}-${side}-ankle`);
    endJoint.position.y = -lowerLength;
    lowerJoint.add(endJoint);
    this.addFoot(endJoint, side);
    return {
      upperJoint,
      lowerJoint,
      endJoint,
      upperLength,
      lowerLength,
    };
  }

  private addHand(wrist: THREE.Group, side: Side): void {
    const palm = this.mesh(
      new THREE.SphereGeometry(0.07, 10, 7),
      this.materials.skin,
      `${side}-shaped-palm`,
    );
    palm.scale.set(0.72, 1.05, 0.48);
    palm.position.y = -0.055;
    wrist.add(palm);
    const fingerGeometry = new THREE.CapsuleGeometry(0.011, 0.055, 3, 6);
    const fingers = this.instancedMesh(
      fingerGeometry,
      this.materials.skin,
      `${side}-fingers`,
      4,
    );
    const fingerPosition = new THREE.Vector3();
    const fingerRotation = new THREE.Quaternion();
    const fingerScale = new THREE.Vector3(1, 1, 1);
    const fingerTransform = new THREE.Matrix4();
    for (let index = 0; index < 4; index += 1) {
      fingerPosition.set((index - 1.5) * 0.019, -0.14, 0);
      fingerRotation.setFromAxisAngle(
        new THREE.Vector3(0, 0, 1),
        (index - 1.5) * 0.035,
      );
      fingerTransform.compose(
        fingerPosition,
        fingerRotation,
        fingerScale,
      );
      fingers.setMatrixAt(index, fingerTransform);
    }
    this.finalizeInstancedMesh(fingers);
    wrist.add(fingers);
    const thumb = this.mesh(
      new THREE.CapsuleGeometry(0.013, 0.045, 3, 6),
      this.materials.skin,
      `${side}-thumb`,
    );
    thumb.position.set(side === "left" ? 0.066 : -0.066, -0.07, 0.012);
    thumb.rotation.z = side === "left" ? -0.75 : 0.75;
    wrist.add(thumb);
  }

  private addFoot(ankle: THREE.Group, side: Side): void {
    const upper = this.mesh(
      new THREE.SphereGeometry(0.09, 10, 7),
      this.materials.footwear,
      `${side}-shoe-upper`,
    );
    upper.scale.set(0.84, 0.58, 1.55);
    upper.position.set(0, -0.045, 0.055);
    ankle.add(upper);
    const sole = this.mesh(
      new THREE.CapsuleGeometry(0.045, 0.16, 4, 8),
      this.materials.rubber,
      `${side}-rubber-sole`,
    );
    sole.rotation.x = Math.PI / 2;
    sole.position.set(0, -0.095, 0.07);
    sole.scale.x = 1.18;
    ankle.add(sole);
  }

  private solveChain(
    chain: TwoBoneChain,
    targetLocal: PosePoint,
    poleLocal: PosePoint,
  ): void {
    this.root.updateMatrixWorld(true);
    const start = chain.upperJoint.getWorldPosition(new THREE.Vector3());
    const target = this.root.localToWorld(
      new THREE.Vector3(targetLocal.x, targetLocal.y, targetLocal.z),
    );
    const pole = this.root.localToWorld(
      new THREE.Vector3(poleLocal.x, poleLocal.y, poleLocal.z),
    );
    const toTarget = target.clone().sub(start);
    const rawDistance = toTarget.length();
    const minimumDistance =
      Math.abs(chain.upperLength - chain.lowerLength) + EPSILON;
    const maximumDistance =
      chain.upperLength + chain.lowerLength - EPSILON;
    const distance = THREE.MathUtils.clamp(
      rawDistance,
      minimumDistance,
      maximumDistance,
    );
    const direction =
      rawDistance > EPSILON
        ? toTarget.multiplyScalar(1 / rawDistance)
        : new THREE.Vector3(0, -1, 0);
    const poleDirection = pole.sub(start);
    poleDirection.addScaledVector(
      direction,
      -poleDirection.dot(direction),
    );
    if (poleDirection.lengthSq() < EPSILON) {
      poleDirection.set(0, 0, 1);
    }
    poleDirection.normalize();
    const along =
      (chain.upperLength * chain.upperLength +
        distance * distance -
        chain.lowerLength * chain.lowerLength) /
      (2 * distance);
    const perpendicular = Math.sqrt(
      Math.max(0, chain.upperLength * chain.upperLength - along * along),
    );
    const elbow = start
      .clone()
      .addScaledVector(direction, along)
      .addScaledVector(poleDirection, perpendicular);
    const reachableTarget = start.clone().addScaledVector(direction, distance);
    const upperDirection = elbow.clone().sub(start).normalize();
    const lowerDirection = reachableTarget.clone().sub(elbow).normalize();

    this.setWorldDirection(chain.upperJoint, upperDirection);
    chain.upperJoint.updateMatrixWorld(true);
    this.setWorldDirection(chain.lowerJoint, lowerDirection);
    chain.lowerJoint.updateMatrixWorld(true);
  }

  private setWorldDirection(joint: THREE.Group, direction: THREE.Vector3): void {
    const worldRotation = new THREE.Quaternion().setFromUnitVectors(
      DOWN,
      direction,
    );
    const parentWorldRotation = new THREE.Quaternion();
    joint.parent?.getWorldQuaternion(parentWorldRotation);
    joint.quaternion.copy(parentWorldRotation.invert().multiply(worldRotation));
  }

  private joint(name: string): THREE.Group {
    const joint = new THREE.Group();
    joint.name = name;
    joint.userData["articulatedJoint"] = true;
    this.joints.push(joint);
    return joint;
  }

  private segment(
    length: number,
    startRadius: number,
    endRadius: number,
    material: THREE.Material,
    name: string,
  ): THREE.Mesh {
    const segment = this.mesh(
      new THREE.CylinderGeometry(endRadius, startRadius, length, 10),
      material,
      name,
    );
    segment.position.y = -length / 2;
    return segment;
  }

  private armSegment(
    length: number,
    radius: number,
    startOverlap: number,
    endOverlap: number,
    material: THREE.Material,
    name: string,
  ): THREE.Mesh {
    const totalLength = length + startOverlap + endOverlap;
    const segment = this.mesh(
      new THREE.CapsuleGeometry(
        radius,
        Math.max(0.01, totalLength - radius * 2),
        4,
        8,
      ),
      material,
      name,
    );
    segment.position.y =
      (-length + startOverlap - endOverlap) / 2;
    return segment;
  }

  private mesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    name: string,
  ): THREE.Mesh {
    geometry.name = `${this.role}-${name}-geometry`;
    this.geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `${this.role}-${name}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private instancedMesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    name: string,
    count: number,
  ): THREE.InstancedMesh {
    geometry.name = `${this.role}-${name}-geometry`;
    this.geometries.push(geometry);
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.name = `${this.role}-${name}`;
    // Eyes, fingers, and hair spikes are too small to improve the fixed camera's
    // shadow silhouette. Keeping them out of the capture-only shadow pass avoids
    // duplicating these detail draw groups.
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    mesh.userData["boundedProceduralDetail"] = true;
    return mesh;
  }

  private finalizeInstancedMesh(mesh: THREE.InstancedMesh): void {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingBox();
    mesh.computeBoundingSphere();
  }

  private worldPoint(object: THREE.Object3D): Readonly<PosePoint> {
    const point = object.getWorldPosition(new THREE.Vector3());
    return Object.freeze({ x: point.x, y: point.y, z: point.z });
  }
}
