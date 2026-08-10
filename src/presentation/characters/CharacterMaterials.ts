import * as THREE from "three";
import {
  type ProceduralMaterialLibrary,
  withSurfaceAlbedo,
  withSurfaceTextures,
} from "../materials/ProceduralMaterials";

export type CharacterRole = "shooter" | "goalkeeper";
export type CharacterSurfaceDetail = "albedo" | "pbr";

export interface CharacterMaterials {
  readonly kit: THREE.MeshStandardMaterial;
  readonly kitAccent: THREE.MeshStandardMaterial;
  readonly lowerKit: THREE.MeshStandardMaterial;
  readonly skin: THREE.MeshStandardMaterial;
  readonly hair: THREE.MeshStandardMaterial;
  readonly rubber: THREE.MeshStandardMaterial;
  readonly footwear: THREE.MeshStandardMaterial;
  readonly eye: THREE.MeshStandardMaterial;
}

function material(
  name: string,
  parameters: THREE.MeshStandardMaterialParameters,
): THREE.MeshStandardMaterial {
  const generated = new THREE.MeshStandardMaterial(parameters);
  generated.name = name;
  generated.userData["proceduralMaterial"] = true;
  return generated;
}

export function createCharacterMaterials(
  role: CharacterRole,
  library?: ProceduralMaterialLibrary,
  surfaceDetail: CharacterSurfaceDetail = "pbr",
): CharacterMaterials {
  const shooter = role === "shooter";
  const surfaceTextures = (
    name: Parameters<ProceduralMaterialLibrary["surface"]>[0],
  ) =>
    library === undefined
      ? {}
      : surfaceDetail === "pbr"
        ? withSurfaceTextures(library.surface(name))
        : withSurfaceAlbedo(library.surface(name));
  const fabric =
    surfaceTextures("fabric");
  const skin = surfaceTextures("skin");
  const hair = surfaceTextures("hair");
  const rubber = surfaceTextures("rubber");
  const paintedMetal = surfaceTextures("painted-metal");
  return Object.freeze({
    kit: material(`${role}-woven-kit`, {
      color: shooter ? 0x102d5b : 0x58df65,
      roughness: shooter ? 0.72 : 0.64,
      metalness: 0.02,
      ...fabric,
      emissive: shooter ? 0x020714 : 0x071f0b,
      emissiveIntensity: 0.08,
    }),
    kitAccent: material(`${role}-kit-accent`, {
      color: shooter ? 0x2e83d8 : 0xc9ff86,
      roughness: 0.58,
      metalness: 0.05,
      ...fabric,
      emissive: shooter ? 0x03152f : 0x173b08,
      emissiveIntensity: 0.14,
    }),
    lowerKit: material(`${role}-lower-kit`, {
      color: shooter ? 0x0d213f : 0x172436,
      roughness: 0.74,
      metalness: 0.01,
      ...fabric,
    }),
    skin: material(`${role}-stylized-skin`, {
      color: shooter ? 0xdf9b73 : 0xd28a65,
      roughness: 0.7,
      metalness: 0,
      ...skin,
    }),
    hair: material(`${role}-matte-hair`, {
      color: shooter ? 0x111827 : 0x251915,
      roughness: 0.9,
      metalness: 0,
      ...hair,
    }),
    rubber: material(`${role}-rubber-sole`, {
      color: 0x080b10,
      roughness: 0.84,
      metalness: 0,
      ...rubber,
    }),
    footwear: material(`${role}-court-footwear`, {
      color: shooter ? 0xe5ebf2 : 0x121923,
      roughness: 0.52,
      metalness: 0.04,
      ...paintedMetal,
    }),
    eye: material(`${role}-eye`, {
      color: 0x11151c,
      roughness: 0.42,
      metalness: 0,
    }),
  });
}

export function createBallRubberMaterial(
  library?: ProceduralMaterialLibrary,
): THREE.MeshStandardMaterial {
  return material("handball-grippy-rubber", {
    color: 0xf0a52f,
    roughness: 0.64,
    metalness: 0.01,
    ...(library === undefined
      ? {}
      : withSurfaceTextures(library.surface("rubber"))),
    emissive: 0x5c1f00,
    emissiveIntensity: 0.24,
  });
}

export function disposeCharacterMaterials(
  materials: CharacterMaterials,
): void {
  for (const generated of Object.values(materials)) {
    generated.dispose();
  }
}
