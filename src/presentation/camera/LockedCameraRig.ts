import * as THREE from "three";

export type LockedCameraProfile =
  | "desktop-wide"
  | "desktop-compact"
  | "mobile-landscape";

export interface LockedCameraLayout {
  readonly profile: LockedCameraProfile;
  readonly aspect: number;
  readonly verticalFovDegrees: number;
  readonly position: Readonly<{ x: number; y: number; z: number }>;
  readonly target: Readonly<{ x: number; y: number; z: number }>;
}

export interface ProjectedBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
  readonly visibleWidth: number;
  readonly visibleHeight: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly fullyVisible: boolean;
}

const GOAL_TARGET = Object.freeze({ x: 0, y: 1.08, z: 7 });
const DESKTOP_WIDE_POSITION = Object.freeze({
  x: -3.3,
  y: 2.15,
  z: -3,
});
const DESKTOP_COMPACT_POSITION = Object.freeze({
  x: -2.9,
  y: 2.2,
  z: -3.2,
});
const MOBILE_LANDSCAPE_POSITION = Object.freeze({
  x: -2.95,
  y: 2.15,
  z: -2.9,
});

export function lockedCameraLayout(
  widthPixels: number,
  heightPixels: number,
): LockedCameraLayout {
  const width = Math.max(1, Math.floor(widthPixels));
  const height = Math.max(1, Math.floor(heightPixels));
  const aspect = width / height;

  if (aspect >= 2) {
    return Object.freeze({
      profile: "mobile-landscape",
      aspect,
      verticalFovDegrees: 34,
      position: MOBILE_LANDSCAPE_POSITION,
      target: GOAL_TARGET,
    });
  }

  if (aspect < 1.7) {
    return Object.freeze({
      profile: "desktop-compact",
      aspect,
      verticalFovDegrees: 37,
      position: DESKTOP_COMPACT_POSITION,
      target: GOAL_TARGET,
    });
  }

  return Object.freeze({
    profile: "desktop-wide",
    aspect,
    verticalFovDegrees: 30,
    position: DESKTOP_WIDE_POSITION,
    target: GOAL_TARGET,
  });
}

export class LockedCameraRig {
  public readonly camera = new THREE.PerspectiveCamera(47, 16 / 9, 0.05, 80);
  private layout: LockedCameraLayout = lockedCameraLayout(1920, 1080);

  public constructor() {
    this.camera.name = "LockedGameplayCamera";
    this.camera.userData["activeGameplayCamera"] = true;
    this.applyLayout(this.layout);
  }

  public resize(widthPixels: number, heightPixels: number): LockedCameraLayout {
    this.layout = lockedCameraLayout(widthPixels, heightPixels);
    this.applyLayout(this.layout);
    return this.layout;
  }

  public currentLayout(): LockedCameraLayout {
    return this.layout;
  }

  public projectBounds(
    minimum: Readonly<{ x: number; y: number; z: number }>,
    maximum: Readonly<{ x: number; y: number; z: number }>,
  ): ProjectedBounds {
    const points = [
      new THREE.Vector3(minimum.x, minimum.y, minimum.z),
      new THREE.Vector3(minimum.x, minimum.y, maximum.z),
      new THREE.Vector3(minimum.x, maximum.y, minimum.z),
      new THREE.Vector3(minimum.x, maximum.y, maximum.z),
      new THREE.Vector3(maximum.x, minimum.y, minimum.z),
      new THREE.Vector3(maximum.x, minimum.y, maximum.z),
      new THREE.Vector3(maximum.x, maximum.y, minimum.z),
      new THREE.Vector3(maximum.x, maximum.y, maximum.z),
    ].map((point) => point.project(this.camera));

    const left = Math.min(...points.map((point) => point.x));
    const right = Math.max(...points.map((point) => point.x));
    const top = Math.max(...points.map((point) => point.y));
    const bottom = Math.min(...points.map((point) => point.y));
    return Object.freeze({
      left,
      right,
      top,
      bottom,
      width: right - left,
      height: top - bottom,
      visibleWidth:
        Math.max(0, Math.min(1, right) - Math.max(-1, left)),
      visibleHeight:
        Math.max(0, Math.min(1, top) - Math.max(-1, bottom)),
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2,
      fullyVisible:
        left >= -1 &&
        right <= 1 &&
        bottom >= -1 &&
        top <= 1 &&
        points.every(
          (point) =>
            Number.isFinite(point.x) &&
            Number.isFinite(point.y) &&
            Number.isFinite(point.z) &&
            point.z >= -1 &&
            point.z <= 1,
        ),
    });
  }

  public projectPoint(
    point: Readonly<{ x: number; y: number; z: number }>,
  ): Readonly<{ x: number; y: number; depth: number; visible: boolean }> {
    const projected = new THREE.Vector3(point.x, point.y, point.z).project(
      this.camera,
    );
    return Object.freeze({
      x: projected.x,
      y: projected.y,
      depth: projected.z,
      visible:
        Number.isFinite(projected.x) &&
        Number.isFinite(projected.y) &&
        Number.isFinite(projected.z) &&
        Math.abs(projected.x) <= 1 &&
        Math.abs(projected.y) <= 1 &&
        projected.z >= -1 &&
        projected.z <= 1,
    });
  }

  private applyLayout(layout: LockedCameraLayout): void {
    this.camera.aspect = layout.aspect;
    this.camera.fov = layout.verticalFovDegrees;
    this.camera.position.set(
      layout.position.x,
      layout.position.y,
      layout.position.z,
    );
    this.camera.lookAt(layout.target.x, layout.target.y, layout.target.z);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld(true);
  }
}
