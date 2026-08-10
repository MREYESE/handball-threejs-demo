import * as THREE from "three";
import { SeededRng } from "../../core/SeededRng";
import type { ProceduralSurfaceTextures } from "../materials/ProceduralMaterials";

export type CrowdLodTier = "hero" | "distant";

export interface CrowdMember {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly yaw: number;
  readonly heightScale: number;
  readonly widthScale: number;
  readonly animationPhase: number;
  readonly pose: number;
  readonly kitColorIndex: number;
  readonly skinColorIndex: number;
  readonly scarfColorIndex: number;
  readonly hasScarf: boolean;
  readonly lod: CrowdLodTier;
}

export interface CrowdDiagnostics {
  readonly totalInstances: number;
  readonly heroLodInstances: number;
  readonly distantLodInstances: number;
  readonly animatedInstances: number;
  readonly staticInstances: number;
  readonly animationMaximumHz: number;
  readonly animationUpdateCount: number;
  readonly matrixWritesLastUpdate: number;
  readonly distantRowsStatic: boolean;
  readonly scarfInstances: number;
  readonly uniqueKitColors: number;
  readonly uniquePoseBands: number;
  readonly uniqueAnimationPhases: number;
  readonly instancedDrawGroups: number;
  readonly staticInstancedDrawGroups: number;
  readonly animatedInstancedDrawGroups: number;
  readonly frustumCulledMeshes: number;
  readonly boundedCullingMeshes: number;
  readonly unboundedCullingMeshes: number;
  readonly sharedGeometryCount: number;
  readonly sharedMaterialCount: number;
}

export interface CrowdRuntimeConfig {
  readonly instanceCount: number;
  readonly animatedInstanceMaximum: number;
  readonly animationMaximumHz: number;
  readonly staticRenderLayer?: number;
  readonly animatedRenderLayer?: number;
}

export const CROWD_KIT_COLORS = Object.freeze([
  0x1557a6,
  0x2580dd,
  0xe9f1ff,
  0x203653,
  0x4b76aa,
  0x7892b5,
] as const);

export const CROWD_SKIN_COLORS = Object.freeze([
  0xf0bc91,
  0xd9976f,
  0xb97452,
  0x8c523c,
  0x603a2d,
] as const);

export const CROWD_SCARF_COLORS = Object.freeze([
  0x35c6ff,
  0xf5f8ff,
  0x1354b9,
  0x88bfff,
] as const);

const CROWD_ROWS = 8;
const SIDE_ROWS = 6;

function crowdRandomRange(
  rng: SeededRng,
  minimum: number,
  maximum: number,
): number {
  return minimum + (maximum - minimum) * rng.nextFloat();
}

function endStandMember(
  index: number,
  count: number,
  rng: SeededRng,
): CrowdMember {
  const columns = Math.max(1, Math.ceil(count / CROWD_ROWS));
  const row = Math.floor(index / columns);
  const column = index % columns;
  const normalizedColumn =
    columns === 1 ? 0.5 : column / Math.max(1, columns - 1);
  let x = THREE.MathUtils.lerp(-8.82, 8.82, normalizedColumn);
  x += crowdRandomRange(rng, -0.18, 0.18);
  for (const aisleX of [-4.1, 4.1]) {
    if (Math.abs(x - aisleX) < 0.34) {
      x += x < aisleX ? -0.34 : 0.34;
    }
  }
  const lod: CrowdLodTier =
    row <= 3 || (row === 4 && column % 3 === 0) ? "hero" : "distant";
  return createMember(
    rng,
    x,
    0.55 + row * 0.43 + crowdRandomRange(rng, -0.055, 0.055),
    9.28 + row * 0.78 + crowdRandomRange(rng, -0.09, 0.09),
    Math.PI + crowdRandomRange(rng, -0.1, 0.1),
    lod,
  );
}

function sideStandMember(
  index: number,
  count: number,
  side: -1 | 1,
  rng: SeededRng,
): CrowdMember {
  const sideCount = Math.ceil(count / 2);
  const columns = Math.max(1, Math.ceil(sideCount / SIDE_ROWS));
  const localIndex = Math.floor(index / 2);
  const row = Math.floor(localIndex / columns);
  const column = localIndex % columns;
  const normalizedColumn =
    columns === 1 ? 0.5 : column / Math.max(1, columns - 1);
  return createMember(
    rng,
    side * (8.78 + row * 0.19),
    0.68 + row * 0.48,
    THREE.MathUtils.lerp(0.8, 13.7, normalizedColumn) +
      crowdRandomRange(rng, -0.09, 0.09),
    side * (Math.PI / 2) + crowdRandomRange(rng, -0.12, 0.12),
    row <= 2 ? "hero" : "distant",
  );
}

function createMember(
  rng: SeededRng,
  x: number,
  y: number,
  z: number,
  yaw: number,
  lod: CrowdLodTier,
): CrowdMember {
  const randomKitColorIndex = rng.nextInt(CROWD_KIT_COLORS.length);
  const kitColorIndex =
    Math.abs(x) < 2.2 && randomKitColorIndex === 2
      ? 4
      : randomKitColorIndex;
  return Object.freeze({
    x,
    y,
    z,
    yaw,
    heightScale: crowdRandomRange(rng, 0.82, 1.2),
    widthScale: crowdRandomRange(rng, 0.82, 1.16),
    animationPhase: rng.nextFloat() * Math.PI * 2,
    pose: crowdRandomRange(rng, -1, 1),
    kitColorIndex,
    skinColorIndex: rng.nextInt(CROWD_SKIN_COLORS.length),
    scarfColorIndex: rng.nextInt(CROWD_SCARF_COLORS.length),
    hasScarf: lod === "hero" && rng.nextFloat() > 0.46,
    lod,
  });
}

export function createCrowdLayout(
  instanceCount: number,
  seed: number,
): readonly CrowdMember[] {
  if (!Number.isInteger(instanceCount) || instanceCount < 1 || instanceCount > 960) {
    throw new RangeError("Crowd instance count must be an integer from 1 to 960.");
  }
  const rng = new SeededRng(seed).fork("arena-crowd");
  const endCount = Math.round(instanceCount * 0.55);
  const members: CrowdMember[] = [];
  for (let index = 0; index < endCount; index += 1) {
    members.push(endStandMember(index, endCount, rng));
  }
  const sideCount = instanceCount - endCount;
  for (let index = 0; index < sideCount; index += 1) {
    members.push(
      sideStandMember(index, sideCount, index % 2 === 0 ? -1 : 1, rng),
    );
  }
  return Object.freeze(members);
}

function crowdMaterial(
  name: string,
  surface: ProceduralSurfaceTextures,
): THREE.MeshLambertMaterial {
  const material = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: surface.albedo,
    emissive:
      name.includes("skin")
        ? 0x1f100b
        : name.includes("scarves")
          ? 0x071a36
          : 0x06142a,
    emissiveIntensity: name.includes("skin") ? 0.16 : 0.22,
  });
  material.name = name;
  material.vertexColors = true;
  material.userData["proceduralMaterial"] = true;
  return material;
}

export class ProceduralCrowd {
  public readonly root = new THREE.Group();
  private readonly layout: readonly CrowdMember[];
  private readonly heroMembers: readonly CrowdMember[];
  private readonly staticHeroMembers: readonly CrowdMember[];
  private readonly distantMembers: readonly CrowdMember[];
  private readonly animatedMembers: readonly CrowdMember[];
  private readonly scarfMembers: readonly CrowdMember[];
  private readonly staticScarfMembers: readonly CrowdMember[];
  private readonly animatedScarfMembers: readonly CrowdMember[];
  private readonly animatedHeroTorso: THREE.InstancedMesh | null;
  private readonly animatedHeroHeads: THREE.InstancedMesh | null;
  private readonly animatedHeroArms: THREE.InstancedMesh | null;
  private readonly animatedScarves: THREE.InstancedMesh | null;
  private readonly staticHeroTorso: THREE.InstancedMesh | null;
  private readonly staticHeroHeads: THREE.InstancedMesh | null;
  private readonly staticHeroArms: THREE.InstancedMesh | null;
  private readonly staticScarves: THREE.InstancedMesh | null;
  private readonly distantBodies: THREE.InstancedMesh;
  private readonly distantHeads: THREE.InstancedMesh;
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private readonly matrix = new THREE.Matrix4();
  private readonly position = new THREE.Vector3();
  private readonly scale = new THREE.Vector3();
  private readonly rotation = new THREE.Quaternion();
  private readonly yawRotation = new THREE.Quaternion();
  private readonly localRotation = new THREE.Quaternion();
  private readonly yAxis = new THREE.Vector3(0, 1, 0);
  private readonly zAxis = new THREE.Vector3(0, 0, 1);
  private readonly animationMaximumHz: number;
  private readonly staticMeshes: readonly THREE.InstancedMesh[];
  private readonly animatedMeshes: readonly THREE.InstancedMesh[];
  private readonly instancedMeshes: readonly THREE.InstancedMesh[];
  private lastAnimationSecond = 0;
  private animationUpdateCount = 0;
  private matrixWritesLastUpdate = 0;
  private disposed = false;

  public constructor(
    config: CrowdRuntimeConfig,
    seed: number,
    fabricSurface: ProceduralSurfaceTextures,
    skinSurface: ProceduralSurfaceTextures,
  ) {
    if (
      !Number.isInteger(config.animatedInstanceMaximum) ||
      config.animatedInstanceMaximum < 0 ||
      config.animatedInstanceMaximum > config.instanceCount
    ) {
      throw new RangeError(
        "Animated crowd maximum must be an integer within the crowd count.",
      );
    }
    if (
      !Number.isFinite(config.animationMaximumHz) ||
      config.animationMaximumHz < 0
    ) {
      throw new RangeError("Crowd animation frequency must be non-negative.");
    }
    this.root.name = "InstancedEuropeanArenaCrowd";
    this.root.userData["presentationOnly"] = true;
    this.root.userData["ownsScoring"] = false;
    this.layout = createCrowdLayout(config.instanceCount, seed);
    this.heroMembers = Object.freeze(
      this.layout.filter((member) => member.lod === "hero"),
    );
    this.distantMembers = Object.freeze(
      this.layout.filter((member) => member.lod === "distant"),
    );
    this.animatedMembers = Object.freeze(
      this.heroMembers.slice(0, config.animatedInstanceMaximum),
    );
    this.staticHeroMembers = Object.freeze(
      this.heroMembers.slice(config.animatedInstanceMaximum),
    );
    this.scarfMembers = Object.freeze(
      this.heroMembers.filter((member) => member.hasScarf),
    );
    const animatedMemberSet = new Set(this.animatedMembers);
    this.animatedScarfMembers = Object.freeze(
      this.scarfMembers.filter((member) => animatedMemberSet.has(member)),
    );
    this.staticScarfMembers = Object.freeze(
      this.scarfMembers.filter((member) => !animatedMemberSet.has(member)),
    );
    this.animationMaximumHz = config.animationMaximumHz;

    const heroTorsoGeometry = this.geometry(
      new THREE.CapsuleGeometry(0.13, 0.35, 3, 7),
    );
    const heroHeadGeometry = this.geometry(
      new THREE.SphereGeometry(0.105, 8, 6),
    );
    const armGeometry = this.geometry(
      new THREE.CylinderGeometry(0.035, 0.045, 0.45, 6),
    );
    const scarfGeometry = this.geometry(new THREE.BoxGeometry(0.48, 0.07, 0.045));
    const distantBodyGeometry = this.geometry(
      new THREE.ConeGeometry(0.14, 0.62, 5),
    );
    const distantHeadGeometry = this.geometry(
      new THREE.SphereGeometry(0.095, 5, 4),
    );
    const kitMaterial = this.material(
      crowdMaterial("crowd-generated-fabric", fabricSurface),
    );
    const skinMaterial = this.material(
      crowdMaterial("crowd-generated-skin", skinSurface),
    );
    const scarfMaterial = this.material(
      crowdMaterial("crowd-generated-scarves", fabricSurface),
    );

    this.animatedHeroTorso = this.instanceMesh(
      heroTorsoGeometry,
      kitMaterial,
      this.animatedMembers.length,
      "CrowdAnimatedHeroLodTorsos",
    );
    this.animatedHeroHeads = this.instanceMesh(
      heroHeadGeometry,
      skinMaterial,
      this.animatedMembers.length,
      "CrowdAnimatedHeroLodHeads",
    );
    this.animatedHeroArms = this.instanceMesh(
      armGeometry,
      kitMaterial,
      this.animatedMembers.length * 2,
      "CrowdAnimatedHeroLodPoseArms",
    );
    this.animatedScarves = this.instanceMesh(
      scarfGeometry,
      scarfMaterial,
      this.animatedScarfMembers.length,
      "CrowdAnimatedHeroLodScarves",
    );
    this.staticHeroTorso = this.instanceMesh(
      heroTorsoGeometry,
      kitMaterial,
      this.staticHeroMembers.length,
      "CrowdStaticHeroLodTorsos",
    );
    this.staticHeroHeads = this.instanceMesh(
      heroHeadGeometry,
      skinMaterial,
      this.staticHeroMembers.length,
      "CrowdStaticHeroLodHeads",
    );
    this.staticHeroArms = this.instanceMesh(
      armGeometry,
      kitMaterial,
      this.staticHeroMembers.length * 2,
      "CrowdStaticHeroLodPoseArms",
    );
    this.staticScarves = this.instanceMesh(
      scarfGeometry,
      scarfMaterial,
      this.staticScarfMembers.length,
      "CrowdStaticHeroLodScarves",
    );
    this.distantBodies = new THREE.InstancedMesh(
      distantBodyGeometry,
      kitMaterial,
      this.distantMembers.length,
    );
    this.distantHeads = new THREE.InstancedMesh(
      distantHeadGeometry,
      skinMaterial,
      this.distantMembers.length,
    );

    this.animatedMeshes = Object.freeze(
      [
        this.animatedHeroTorso,
        this.animatedHeroHeads,
        this.animatedHeroArms,
        this.animatedScarves,
      ].filter(
        (mesh): mesh is THREE.InstancedMesh => mesh !== null,
      ),
    );
    this.staticMeshes = Object.freeze(
      [
        this.staticHeroTorso,
        this.staticHeroHeads,
        this.staticHeroArms,
        this.staticScarves,
        this.distantBodies,
        this.distantHeads,
      ].filter(
        (mesh): mesh is THREE.InstancedMesh => mesh !== null,
      ),
    );
    this.instancedMeshes = Object.freeze([
      ...this.animatedMeshes,
      ...this.staticMeshes,
    ]);
    const staticRenderLayer = config.staticRenderLayer ?? 0;
    const animatedRenderLayer = config.animatedRenderLayer ?? 0;
    for (const mesh of this.animatedMeshes) {
      mesh.layers.set(animatedRenderLayer);
      mesh.userData["crowdMotion"] = "animated";
    }
    for (const mesh of this.staticMeshes) {
      mesh.layers.set(staticRenderLayer);
      mesh.userData["crowdMotion"] = "static";
    }
    for (const mesh of this.instancedMeshes) {
      mesh.frustumCulled = true;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.userData["crowdLod"] =
        mesh === this.distantBodies || mesh === this.distantHeads
          ? "distant"
          : "hero";
      this.root.add(mesh);
    }
    this.distantBodies.name = "CrowdDistantLodBodies";
    this.distantHeads.name = "CrowdDistantLodHeads";
    for (const mesh of this.animatedMeshes) {
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }
    this.applyInstanceColors();
    this.initializeInstanceMatrices();
    this.computeConservativeBounds();
  }

  public update(simulationSeconds: number): void {
    if (
      this.animatedMembers.length === 0 ||
      this.animationMaximumHz === 0 ||
      simulationSeconds - this.lastAnimationSecond + Number.EPSILON <
        1 / this.animationMaximumHz
    ) {
      return;
    }
    this.lastAnimationSecond = simulationSeconds;
    this.animationUpdateCount += 1;
    this.matrixWritesLastUpdate = 0;
    for (let index = 0; index < this.animatedMembers.length; index += 1) {
      const member = this.animatedMembers[index];
      if (member === undefined) {
        continue;
      }
      const wave = Math.sin(simulationSeconds * 2.4 + member.animationPhase);
      const bob = wave * 0.025 * member.heightScale;
      if (
        this.animatedHeroTorso === null ||
        this.animatedHeroHeads === null ||
        this.animatedHeroArms === null
      ) {
        throw new Error("Animated crowd meshes are missing.");
      }
      this.setBodyMatrix(
        this.animatedHeroTorso,
        index,
        member,
        bob,
        0.5,
        member.widthScale,
        member.heightScale,
      );
      this.setBodyMatrix(
        this.animatedHeroHeads,
        index,
        member,
        bob,
        0.91,
        member.widthScale,
        member.heightScale,
      );
      this.matrixWritesLastUpdate += 2;
      this.setArmMatrix(
        this.animatedHeroArms,
        member,
        index * 2,
        -1,
        wave,
        bob,
      );
      this.setArmMatrix(
        this.animatedHeroArms,
        member,
        index * 2 + 1,
        1,
        wave,
        bob,
      );
      this.matrixWritesLastUpdate += 2;
    }
    for (let index = 0; index < this.animatedScarfMembers.length; index += 1) {
      const member = this.animatedScarfMembers[index];
      if (member === undefined) {
        continue;
      }
      if (this.animatedScarves === null) {
        throw new Error("Animated crowd scarf mesh is missing.");
      }
      const wave = Math.sin(simulationSeconds * 2.4 + member.animationPhase);
      this.setBodyMatrix(
        this.animatedScarves,
        index,
        member,
        wave * 0.03,
        0.82,
        member.widthScale,
        member.heightScale,
      );
      this.matrixWritesLastUpdate += 1;
    }
    this.markMatrixRange(
      this.animatedHeroTorso,
      this.animatedMembers.length,
    );
    this.markMatrixRange(
      this.animatedHeroHeads,
      this.animatedMembers.length,
    );
    this.markMatrixRange(
      this.animatedHeroArms,
      this.animatedMembers.length * 2,
    );
    this.markMatrixRange(
      this.animatedScarves,
      this.animatedScarfMembers.length,
    );
  }

  public diagnostics(): CrowdDiagnostics {
    return Object.freeze({
      totalInstances: this.layout.length,
      heroLodInstances: this.heroMembers.length,
      distantLodInstances: this.distantMembers.length,
      animatedInstances: this.animatedMembers.length,
      staticInstances: this.layout.length - this.animatedMembers.length,
      animationMaximumHz: this.animationMaximumHz,
      animationUpdateCount: this.animationUpdateCount,
      matrixWritesLastUpdate: this.matrixWritesLastUpdate,
      distantRowsStatic: true,
      scarfInstances: this.scarfMembers.length,
      uniqueKitColors: new Set(
        this.layout.map((member) => member.kitColorIndex),
      ).size,
      uniquePoseBands: new Set(
        this.layout.map((member) => Math.round(member.pose * 8)),
      ).size,
      uniqueAnimationPhases: new Set(
        this.layout.map((member) => Math.round(member.animationPhase * 100)),
      ).size,
      instancedDrawGroups: this.instancedMeshes.length,
      staticInstancedDrawGroups: this.staticMeshes.length,
      animatedInstancedDrawGroups: this.animatedMeshes.length,
      frustumCulledMeshes: this.instancedMeshes.filter(
        (mesh) => mesh.frustumCulled,
      ).length,
      boundedCullingMeshes: this.instancedMeshes.filter(
        (mesh) => mesh.boundingBox !== null && mesh.boundingSphere !== null,
      ).length,
      unboundedCullingMeshes: this.instancedMeshes.filter(
        (mesh) => mesh.boundingBox === null || mesh.boundingSphere === null,
      ).length,
      sharedGeometryCount: this.geometries.length,
      sharedMaterialCount: this.materials.length,
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
    for (const material of this.materials) {
      material.dispose();
    }
  }

  private initializeInstanceMatrices(): void {
    for (let index = 0; index < this.animatedMembers.length; index += 1) {
      const member = this.animatedMembers[index];
      if (member === undefined) {
        continue;
      }
      if (
        this.animatedHeroTorso === null ||
        this.animatedHeroHeads === null ||
        this.animatedHeroArms === null
      ) {
        throw new Error("Animated crowd meshes are missing.");
      }
      const wave = Math.sin(member.animationPhase);
      const bob = wave * 0.025 * member.heightScale;
      this.setBodyMatrix(
        this.animatedHeroTorso,
        index,
        member,
        bob,
        0.5,
        member.widthScale,
        member.heightScale,
      );
      this.setBodyMatrix(
        this.animatedHeroHeads,
        index,
        member,
        bob,
        0.91,
        member.widthScale,
        member.heightScale,
      );
      this.setArmMatrix(
        this.animatedHeroArms,
        member,
        index * 2,
        -1,
        wave,
        bob,
      );
      this.setArmMatrix(
        this.animatedHeroArms,
        member,
        index * 2 + 1,
        1,
        wave,
        bob,
      );
    }
    for (let index = 0; index < this.animatedScarfMembers.length; index += 1) {
      const member = this.animatedScarfMembers[index];
      if (member === undefined) {
        continue;
      }
      if (this.animatedScarves === null) {
        throw new Error("Animated crowd scarf mesh is missing.");
      }
      const wave = Math.sin(member.animationPhase);
      this.setBodyMatrix(
        this.animatedScarves,
        index,
        member,
        wave * 0.03,
        0.82,
        member.widthScale,
        member.heightScale,
      );
    }
    for (let index = 0; index < this.staticHeroMembers.length; index += 1) {
      const member = this.staticHeroMembers[index];
      if (member === undefined) {
        continue;
      }
      if (
        this.staticHeroTorso === null ||
        this.staticHeroHeads === null ||
        this.staticHeroArms === null
      ) {
        throw new Error("Static crowd meshes are missing.");
      }
      const wave = Math.sin(member.animationPhase);
      const bob = wave * 0.025 * member.heightScale;
      this.setBodyMatrix(
        this.staticHeroTorso,
        index,
        member,
        bob,
        0.5,
        member.widthScale,
        member.heightScale,
      );
      this.setBodyMatrix(
        this.staticHeroHeads,
        index,
        member,
        bob,
        0.91,
        member.widthScale,
        member.heightScale,
      );
      this.setArmMatrix(
        this.staticHeroArms,
        member,
        index * 2,
        -1,
        wave,
        bob,
      );
      this.setArmMatrix(
        this.staticHeroArms,
        member,
        index * 2 + 1,
        1,
        wave,
        bob,
      );
    }
    for (let index = 0; index < this.staticScarfMembers.length; index += 1) {
      const member = this.staticScarfMembers[index];
      if (member === undefined) {
        continue;
      }
      if (this.staticScarves === null) {
        throw new Error("Static crowd scarf mesh is missing.");
      }
      const wave = Math.sin(member.animationPhase);
      this.setBodyMatrix(
        this.staticScarves,
        index,
        member,
        wave * 0.03,
        0.82,
        member.widthScale,
        member.heightScale,
      );
    }
    for (let index = 0; index < this.distantMembers.length; index += 1) {
      const member = this.distantMembers[index];
      if (member === undefined) {
        continue;
      }
      this.setBodyMatrix(
        this.distantBodies,
        index,
        member,
        0,
        0.43,
        member.widthScale,
        member.heightScale,
      );
      this.setBodyMatrix(
        this.distantHeads,
        index,
        member,
        0,
        0.81,
        member.widthScale,
        member.heightScale,
      );
    }
    for (const mesh of this.instancedMeshes) {
      mesh.instanceMatrix.needsUpdate = true;
    }
  }

  private computeConservativeBounds(): void {
    for (const mesh of this.instancedMeshes) {
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
      mesh.boundingBox?.expandByScalar(0.12);
      if (mesh.boundingSphere !== null) {
        mesh.boundingSphere.radius += 0.12;
      }
    }
  }

  private markMatrixRange(
    mesh: THREE.InstancedMesh | null,
    instanceCount: number,
  ): void {
    if (mesh === null || instanceCount === 0) {
      return;
    }
    mesh.instanceMatrix.clearUpdateRanges();
    mesh.instanceMatrix.addUpdateRange(0, instanceCount * 16);
    mesh.instanceMatrix.needsUpdate = true;
  }

  private applyInstanceColors(): void {
    for (let index = 0; index < this.animatedMembers.length; index += 1) {
      const member = this.animatedMembers[index];
      if (member === undefined) {
        continue;
      }
      if (
        this.animatedHeroTorso === null ||
        this.animatedHeroHeads === null ||
        this.animatedHeroArms === null
      ) {
        throw new Error("Animated crowd meshes are missing.");
      }
      const kitColor = new THREE.Color(
        CROWD_KIT_COLORS[member.kitColorIndex] ?? 0xffffff,
      );
      const skinColor = new THREE.Color(
        CROWD_SKIN_COLORS[member.skinColorIndex] ?? 0xffffff,
      );
      this.animatedHeroTorso.setColorAt(index, kitColor);
      this.animatedHeroHeads.setColorAt(index, skinColor);
      this.animatedHeroArms.setColorAt(index * 2, kitColor);
      this.animatedHeroArms.setColorAt(index * 2 + 1, kitColor);
    }
    for (let index = 0; index < this.staticHeroMembers.length; index += 1) {
      const member = this.staticHeroMembers[index];
      if (member === undefined) {
        continue;
      }
      if (
        this.staticHeroTorso === null ||
        this.staticHeroHeads === null ||
        this.staticHeroArms === null
      ) {
        throw new Error("Static crowd meshes are missing.");
      }
      const kitColor = new THREE.Color(
        CROWD_KIT_COLORS[member.kitColorIndex] ?? 0xffffff,
      );
      const skinColor = new THREE.Color(
        CROWD_SKIN_COLORS[member.skinColorIndex] ?? 0xffffff,
      );
      this.staticHeroTorso.setColorAt(index, kitColor);
      this.staticHeroHeads.setColorAt(index, skinColor);
      this.staticHeroArms.setColorAt(index * 2, kitColor);
      this.staticHeroArms.setColorAt(index * 2 + 1, kitColor);
    }
    for (let index = 0; index < this.animatedScarfMembers.length; index += 1) {
      const member = this.animatedScarfMembers[index];
      if (member === undefined) {
        continue;
      }
      if (this.animatedScarves === null) {
        throw new Error("Animated crowd scarf mesh is missing.");
      }
      this.animatedScarves.setColorAt(
        index,
        new THREE.Color(
          CROWD_SCARF_COLORS[member.scarfColorIndex] ?? 0xffffff,
        ),
      );
    }
    for (let index = 0; index < this.staticScarfMembers.length; index += 1) {
      const member = this.staticScarfMembers[index];
      if (member === undefined) {
        continue;
      }
      if (this.staticScarves === null) {
        throw new Error("Static crowd scarf mesh is missing.");
      }
      this.staticScarves.setColorAt(
        index,
        new THREE.Color(
          CROWD_SCARF_COLORS[member.scarfColorIndex] ?? 0xffffff,
        ),
      );
    }
    for (let index = 0; index < this.distantMembers.length; index += 1) {
      const member = this.distantMembers[index];
      if (member === undefined) {
        continue;
      }
      this.distantBodies.setColorAt(
        index,
        new THREE.Color(
          CROWD_KIT_COLORS[member.kitColorIndex] ?? 0xffffff,
        ),
      );
      this.distantHeads.setColorAt(
        index,
        new THREE.Color(
          CROWD_SKIN_COLORS[member.skinColorIndex] ?? 0xffffff,
        ),
      );
    }
    for (const mesh of this.instancedMeshes) {
      if (mesh.instanceColor !== null) {
        mesh.instanceColor.needsUpdate = true;
      }
    }
  }

  private setBodyMatrix(
    mesh: THREE.InstancedMesh,
    index: number,
    member: CrowdMember,
    bob: number,
    heightOffset: number,
    widthScale: number,
    heightScale: number,
  ): void {
    this.position.set(
      member.x,
      member.y + heightOffset * heightScale + bob,
      member.z,
    );
    this.rotation.setFromAxisAngle(this.yAxis, member.yaw);
    this.scale.set(widthScale, heightScale, widthScale * 0.9);
    this.matrix.compose(this.position, this.rotation, this.scale);
    mesh.setMatrixAt(index, this.matrix);
  }

  private setArmMatrix(
    mesh: THREE.InstancedMesh,
    member: CrowdMember,
    index: number,
    side: -1 | 1,
    wave: number,
    bob: number,
  ): void {
    const armAngle =
      side * (0.22 + Math.abs(member.pose) * 0.92 + wave * 0.14);
    const localShoulderX = side * 0.18 * member.widthScale;
    const halfLength = 0.225 * member.heightScale;
    const localX = localShoulderX - Math.sin(armAngle) * halfLength;
    const localY =
      0.69 * member.heightScale + Math.cos(armAngle) * halfLength;
    this.position.set(
      member.x + Math.cos(member.yaw) * localX,
      member.y + localY + bob,
      member.z - Math.sin(member.yaw) * localX,
    );
    this.yawRotation.setFromAxisAngle(this.yAxis, member.yaw);
    this.localRotation.setFromAxisAngle(this.zAxis, armAngle);
    this.rotation.multiplyQuaternions(this.yawRotation, this.localRotation);
    this.scale.set(
      member.widthScale,
      member.heightScale,
      member.widthScale,
    );
    this.matrix.compose(this.position, this.rotation, this.scale);
    mesh.setMatrixAt(index, this.matrix);
  }

  private instanceMesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    instanceCount: number,
    name: string,
  ): THREE.InstancedMesh | null {
    if (instanceCount === 0) {
      return null;
    }
    const mesh = new THREE.InstancedMesh(
      geometry,
      material,
      instanceCount,
    );
    mesh.name = name;
    return mesh;
  }

  private geometry<Geometry extends THREE.BufferGeometry>(
    geometry: Geometry,
  ): Geometry {
    this.geometries.push(geometry);
    return geometry;
  }

  private material<Material extends THREE.Material>(material: Material): Material {
    this.materials.push(material);
    return material;
  }
}
