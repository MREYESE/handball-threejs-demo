import * as THREE from "three";
import type { QualityPreset } from "../../core/Quality";
import type { Disposable } from "../../core/ResourceTracker";

export interface StaticLayerFrameWork {
  readonly drawCalls: number;
  readonly triangles: number;
}

export interface LockedStaticLayerCacheDiagnostics {
  readonly enabled: true;
  readonly valid: boolean;
  readonly quality: QualityPreset;
  readonly widthPixels: number;
  readonly heightPixels: number;
  readonly pixelRatio: number;
  readonly rebuildCount: number;
  readonly invalidationCount: number;
  readonly createdRenderTargets: number;
  readonly disposedRenderTargets: number;
  readonly activeRenderTargets: number;
  readonly orphanedRenderTargets: number;
  readonly staticDrawCallsAtRebuild: number;
  readonly staticTrianglesAtRebuild: number;
}

const CACHE_TEXTURE_NAME = "LockedArenaStaticLayer";

export class LockedStaticLayerCache implements Disposable {
  private readonly frameWork = {
    drawCalls: 0,
    triangles: 0,
  };
  private readonly compositeScene = new THREE.Scene();
  private readonly compositeCamera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    0,
    1,
  );
  private readonly compositeGeometry = new THREE.PlaneGeometry(2, 2);
  private readonly compositeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    depthTest: false,
    depthWrite: false,
    // The static arena was already tone-mapped when rendered into the cache.
    // Applying ACES again while compositing crushed crowd and stand midtones.
    toneMapped: false,
  });
  private renderTarget: THREE.WebGLRenderTarget | null = null;
  private quality: QualityPreset;
  private widthPixels = 0;
  private heightPixels = 0;
  private pixelRatio = 1;
  private rebuildCount = 0;
  private invalidationCount = 0;
  private createdRenderTargets = 0;
  private disposedRenderTargets = 0;
  private staticDrawCallsAtRebuild = 0;
  private staticTrianglesAtRebuild = 0;
  private valid = false;
  private disposed = false;

  public constructor(quality: QualityPreset) {
    this.quality = quality;
    const quad = new THREE.Mesh(
      this.compositeGeometry,
      this.compositeMaterial,
    );
    quad.frustumCulled = false;
    quad.name = "LockedArenaStaticLayerComposite";
    this.compositeScene.add(quad);
  }

  public get isValid(): boolean {
    return this.valid;
  }

  public configure(
    widthPixels: number,
    heightPixels: number,
    pixelRatio: number,
    quality: QualityPreset,
  ): boolean {
    this.assertUsable();
    const width = Math.max(1, Math.floor(widthPixels));
    const height = Math.max(1, Math.floor(heightPixels));
    const ratio = Math.max(0.25, pixelRatio);
    if (
      this.renderTarget !== null &&
      this.widthPixels === width &&
      this.heightPixels === height &&
      this.pixelRatio === ratio &&
      this.quality === quality
    ) {
      return false;
    }

    this.disposeRenderTarget();
    this.widthPixels = width;
    this.heightPixels = height;
    this.pixelRatio = ratio;
    this.quality = quality;
    const targetWidth = Math.max(1, Math.floor(width * ratio));
    const targetHeight = Math.max(1, Math.floor(height * ratio));
    this.renderTarget = new THREE.WebGLRenderTarget(
      targetWidth,
      targetHeight,
      {
        depthBuffer: true,
        stencilBuffer: false,
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter,
        generateMipmaps: false,
      },
    );
    this.renderTarget.texture.name = CACHE_TEXTURE_NAME;
    this.renderTarget.texture.colorSpace = THREE.SRGBColorSpace;
    this.compositeMaterial.map = this.renderTarget.texture;
    this.compositeMaterial.needsUpdate = true;
    this.createdRenderTargets += 1;
    this.invalidationCount += 1;
    this.valid = false;
    return true;
  }

  public async compileComposite(
    renderer: THREE.WebGLRenderer,
  ): Promise<void> {
    this.assertUsable();
    await renderer.compileAsync(this.compositeScene, this.compositeCamera);
  }

  public rebuild(
    renderer: THREE.WebGLRenderer,
    renderStaticLayer: () => void,
  ): void {
    this.assertUsable();
    const target = this.renderTarget;
    if (target === null) {
      throw new Error(
        "The locked static layer cache must be configured before rebuilding.",
      );
    }

    const previousTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(target);
    try {
      renderer.clear(true, true, true);
      renderStaticLayer();
      this.staticDrawCallsAtRebuild = renderer.info.render.calls;
      this.staticTrianglesAtRebuild = renderer.info.render.triangles;
    } finally {
      renderer.setRenderTarget(previousTarget);
    }
    this.valid = true;
    this.rebuildCount += 1;
  }

  public present(
    renderer: THREE.WebGLRenderer,
    renderDynamicLayer: () => void,
  ): StaticLayerFrameWork {
    this.assertUsable();
    if (!this.valid || this.renderTarget === null) {
      throw new Error(
        "The locked static layer cache must be rebuilt before presentation.",
      );
    }

    const previousAutoClear = renderer.autoClear;
    let compositeCalls = 0;
    let compositeTriangles = 0;
    let dynamicCalls = 0;
    let dynamicTriangles = 0;
    try {
      renderer.setRenderTarget(null);
      renderer.autoClear = true;
      renderer.render(this.compositeScene, this.compositeCamera);
      compositeCalls = renderer.info.render.calls;
      compositeTriangles = renderer.info.render.triangles;

      renderer.autoClear = false;
      renderer.clearDepth();
      renderDynamicLayer();
      dynamicCalls = renderer.info.render.calls;
      dynamicTriangles = renderer.info.render.triangles;
    } finally {
      renderer.autoClear = previousAutoClear;
    }

    this.frameWork.drawCalls = compositeCalls + dynamicCalls;
    this.frameWork.triangles = compositeTriangles + dynamicTriangles;
    return this.frameWork;
  }

  public diagnostics(): LockedStaticLayerCacheDiagnostics {
    const liveTarget = this.renderTarget === null ? 0 : 1;
    return Object.freeze({
      enabled: true,
      valid: this.valid,
      quality: this.quality,
      widthPixels: this.widthPixels,
      heightPixels: this.heightPixels,
      pixelRatio: this.pixelRatio,
      rebuildCount: this.rebuildCount,
      invalidationCount: this.invalidationCount,
      createdRenderTargets: this.createdRenderTargets,
      disposedRenderTargets: this.disposedRenderTargets,
      activeRenderTargets: liveTarget,
      orphanedRenderTargets:
        this.createdRenderTargets -
        this.disposedRenderTargets -
        liveTarget,
      staticDrawCallsAtRebuild: this.staticDrawCallsAtRebuild,
      staticTrianglesAtRebuild: this.staticTrianglesAtRebuild,
    });
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    this.disposeRenderTarget();
    this.compositeMaterial.dispose();
    this.compositeGeometry.dispose();
  }

  private disposeRenderTarget(): void {
    if (this.renderTarget === null) {
      return;
    }
    this.renderTarget.dispose();
    this.renderTarget = null;
    this.compositeMaterial.map = null;
    this.disposedRenderTargets += 1;
    this.valid = false;
  }

  private assertUsable(): void {
    if (this.disposed) {
      throw new Error("The locked static layer cache has been disposed.");
    }
  }
}
