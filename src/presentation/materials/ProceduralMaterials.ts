import * as THREE from "three";

export const PROCEDURAL_SURFACE_NAMES = Object.freeze([
  "court",
  "painted-metal",
  "fabric",
  "skin",
  "hair",
  "rubber",
  "net",
  "wall-panel",
  "led-board",
] as const);

export type ProceduralSurfaceName =
  (typeof PROCEDURAL_SURFACE_NAMES)[number];

export interface ProceduralSurfaceTextures {
  readonly name: ProceduralSurfaceName;
  readonly albedo: THREE.CanvasTexture;
  readonly normal: THREE.CanvasTexture;
  readonly roughness: THREE.CanvasTexture;
  readonly alpha: THREE.CanvasTexture | null;
  readonly resolution: number;
  readonly detailScales: readonly [number, number];
}

export interface ProceduralMaterialDiagnostics {
  readonly surfaceNames: readonly ProceduralSurfaceName[];
  readonly textureCount: number;
  readonly largestTextureEdge: number;
  readonly multiScaleSurfaceCount: number;
  readonly generatedTextTextureCount: number;
}

export interface TextPanelOptions {
  readonly width: number;
  readonly height: number;
  readonly background: string;
  readonly foreground: string;
  readonly accent: string;
  readonly fontPixels: number;
}

const SURFACE_SEEDS = {
  court: 0x31c0_4a11,
  "painted-metal": 0x0bad_c0de,
  fabric: 0xfab1_c501,
  skin: 0x5a17_0a11,
  hair: 0xa113_5eed,
  rubber: 0xb411_0bad,
  net: 0x0e71_aced,
  "wall-panel": 0xa11a_c057,
  "led-board": 0x1edb_0a4d,
} as const satisfies Record<ProceduralSurfaceName, number>;

const ROUGHNESS_BASE = {
  court: 0.5,
  "painted-metal": 0.42,
  fabric: 0.78,
  skin: 0.67,
  hair: 0.86,
  rubber: 0.82,
  net: 0.72,
  "wall-panel": 0.88,
  "led-board": 0.36,
} as const satisfies Record<ProceduralSurfaceName, number>;

const DETAIL_SCALES = {
  court: [7, 61],
  "painted-metal": [9, 73],
  fabric: [18, 92],
  skin: [6, 47],
  hair: [12, 79],
  rubber: [10, 58],
  net: [8, 64],
  "wall-panel": [5, 43],
  "led-board": [14, 96],
} as const satisfies Record<
  ProceduralSurfaceName,
  readonly [number, number]
>;

function hash01(x: number, y: number, seed: number): number {
  let value =
    Math.imul((x + 1) ^ seed, 0x45d9_f3b) ^
    Math.imul((y + 1) ^ (seed >>> 8), 0x119d_e1f3);
  value = Math.imul(value ^ (value >>> 16), 0x45d9_f3b);
  value ^= value >>> 16;
  return (value >>> 0) / 0xffff_ffff;
}

function surfaceSignal(
  name: ProceduralSurfaceName,
  x: number,
  y: number,
  seed: number,
): number {
  const [macroScale, microScale] = DETAIL_SCALES[name];
  const macro =
    Math.sin((x / macroScale) * Math.PI * 2) * 0.28 +
    Math.cos((y / (macroScale * 1.7)) * Math.PI * 2) * 0.18;
  const micro =
    Math.sin(((x + y * 0.37) / microScale) * Math.PI * 2) * 0.16;
  const grain = hash01(x, y, seed) * 2 - 1;

  switch (name) {
    case "court": {
      const boardPass = Math.sin((x / 46) * Math.PI) * 0.16;
      const shoeWear = hash01(Math.floor(x / 7), Math.floor(y / 13), seed) - 0.5;
      return macro * 0.22 + micro * 0.12 + grain * 0.16 + boardPass + shoeWear * 0.12;
    }
    case "painted-metal": {
      const brushed = Math.sin(y * 0.82) * 0.08;
      const sparseChip = hash01(Math.floor(x / 3), Math.floor(y / 11), seed);
      return macro * 0.08 + grain * 0.08 + brushed + (sparseChip > 0.985 ? -0.48 : 0);
    }
    case "fabric": {
      const warp = Math.sin(x * 1.18) * 0.34;
      const weft = Math.sin(y * 1.36) * 0.3;
      return warp + weft + macro * 0.08 + grain * 0.05;
    }
    case "skin":
      return macro * 0.08 + micro * 0.05 + grain * 0.055;
    case "hair": {
      const strands = Math.sin((x * 0.24 + y * 1.18)) * 0.34;
      return strands + macro * 0.08 + grain * 0.06;
    }
    case "rubber": {
      const cellX = Math.sin(x * 0.44);
      const cellY = Math.sin(y * 0.44);
      return cellX * cellY * 0.28 + macro * 0.08 + grain * 0.12;
    }
    case "net": {
      const cord = Math.sin(x * 0.62) + Math.sin(y * 0.62);
      return cord * 0.16 + grain * 0.06;
    }
    case "wall-panel": {
      const porous = hash01(Math.floor(x / 2), Math.floor(y / 2), seed) - 0.5;
      const groove = x % 48 < 2 || y % 64 < 2 ? -0.35 : 0;
      return macro * 0.13 + porous * 0.3 + groove;
    }
    case "led-board": {
      const scanline = y % 4 === 0 ? -0.2 : 0.08;
      return scanline + micro * 0.1 + grain * 0.035;
    }
  }
}

function surfaceResolution(
  name: ProceduralSurfaceName,
  baseResolution: number,
): number {
  if (name === "wall-panel") {
    return 32;
  }
  if (name === "led-board") {
    return Math.max(32, Math.floor(baseResolution / 2));
  }
  return baseResolution;
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if (context === null) {
    throw new Error("Procedural texture generation requires a 2D canvas context.");
  }
  return context;
}

function textureFromCanvas(
  canvas: HTMLCanvasElement,
  colorSpace: THREE.ColorSpace,
  repeatX = 1,
  repeatY = 1,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 4;
  texture.userData["generatedInCode"] = true;
  return texture;
}

function createSurfaceTextures(
  name: ProceduralSurfaceName,
  baseResolution: number,
): ProceduralSurfaceTextures {
  const resolution = surfaceResolution(name, baseResolution);
  const albedoCanvas = createCanvas(resolution, resolution);
  const normalCanvas = createCanvas(resolution, resolution);
  const roughnessCanvas = createCanvas(resolution, resolution);
  const albedoContext = context2d(albedoCanvas);
  const normalContext = context2d(normalCanvas);
  const roughnessContext = context2d(roughnessCanvas);
  const albedoImage = albedoContext.createImageData(resolution, resolution);
  const normalImage = normalContext.createImageData(resolution, resolution);
  const roughnessImage = roughnessContext.createImageData(
    resolution,
    resolution,
  );
  const seed = SURFACE_SEEDS[name];

  for (let y = 0; y < resolution; y += 1) {
    for (let x = 0; x < resolution; x += 1) {
      const offset = (y * resolution + x) * 4;
      const signal = surfaceSignal(name, x, y, seed);
      const right = surfaceSignal(name, x + 1, y, seed);
      const down = surfaceSignal(name, x, y + 1, seed);
      const albedo = THREE.MathUtils.clamp(
        Math.round((0.82 + signal * 0.13) * 255),
        0,
        255,
      );
      const normalX = THREE.MathUtils.clamp(
        Math.round(128 - (right - signal) * 72),
        0,
        255,
      );
      const normalY = THREE.MathUtils.clamp(
        Math.round(128 - (down - signal) * 72),
        0,
        255,
      );
      const roughness = THREE.MathUtils.clamp(
        Math.round((ROUGHNESS_BASE[name] + signal * 0.09) * 255),
        8,
        250,
      );

      albedoImage.data[offset] = albedo;
      albedoImage.data[offset + 1] = albedo;
      albedoImage.data[offset + 2] = albedo;
      albedoImage.data[offset + 3] = 255;
      normalImage.data[offset] = normalX;
      normalImage.data[offset + 1] = normalY;
      normalImage.data[offset + 2] = 246;
      normalImage.data[offset + 3] = 255;
      roughnessImage.data[offset] = roughness;
      roughnessImage.data[offset + 1] = roughness;
      roughnessImage.data[offset + 2] = roughness;
      roughnessImage.data[offset + 3] = 255;
    }
  }

  albedoContext.putImageData(albedoImage, 0, 0);
  normalContext.putImageData(normalImage, 0, 0);
  roughnessContext.putImageData(roughnessImage, 0, 0);

  let alpha: THREE.CanvasTexture | null = null;
  if (name === "net") {
    const alphaCanvas = createCanvas(resolution, resolution);
    const alphaContext = context2d(alphaCanvas);
    alphaContext.fillStyle = "#000";
    alphaContext.fillRect(0, 0, resolution, resolution);
    alphaContext.strokeStyle = "#fff";
    alphaContext.lineWidth = Math.max(2, resolution / 80);
    const cellSize = resolution / 10;
    for (let index = 0; index <= 10; index += 1) {
      const coordinate = index * cellSize;
      alphaContext.beginPath();
      alphaContext.moveTo(coordinate, 0);
      alphaContext.lineTo(coordinate, resolution);
      alphaContext.stroke();
      alphaContext.beginPath();
      alphaContext.moveTo(0, coordinate);
      alphaContext.lineTo(resolution, coordinate);
      alphaContext.stroke();
    }
    alpha = textureFromCanvas(alphaCanvas, THREE.NoColorSpace);
  }

  const repeats: Partial<
    Record<ProceduralSurfaceName, readonly [number, number]>
  > = {
    court: [5, 7],
    fabric: [3, 5],
    "painted-metal": [2, 5],
    "wall-panel": [2, 2],
  };
  const repeat = repeats[name] ?? [1, 1];
  return Object.freeze({
    name,
    albedo: textureFromCanvas(
      albedoCanvas,
      THREE.SRGBColorSpace,
      repeat[0],
      repeat[1],
    ),
    normal: textureFromCanvas(
      normalCanvas,
      THREE.NoColorSpace,
      repeat[0],
      repeat[1],
    ),
    roughness: textureFromCanvas(
      roughnessCanvas,
      THREE.NoColorSpace,
      repeat[0],
      repeat[1],
    ),
    alpha,
    resolution,
    detailScales: DETAIL_SCALES[name],
  });
}

export class ProceduralMaterialLibrary {
  private readonly surfaces = new Map<
    ProceduralSurfaceName,
    ProceduralSurfaceTextures
  >();
  private readonly generatedTextTextures: THREE.CanvasTexture[] = [];
  private readonly extraTextures: THREE.CanvasTexture[] = [];
  private readonly maximumResolution: number;
  private largestAuxiliaryTextureEdge = 0;
  private disposed = false;

  public constructor(baseResolution: number) {
    if (
      !Number.isInteger(baseResolution) ||
      baseResolution < 96 ||
      baseResolution > 256
    ) {
      throw new RangeError(
        "Procedural texture base resolution must be an integer from 96 to 256.",
      );
    }
    this.maximumResolution = baseResolution;
    for (const name of PROCEDURAL_SURFACE_NAMES) {
      this.surfaces.set(name, createSurfaceTextures(name, baseResolution));
    }
  }

  public surface(name: ProceduralSurfaceName): ProceduralSurfaceTextures {
    const textures = this.surfaces.get(name);
    if (textures === undefined) {
      throw new Error(`Unknown procedural surface '${name}'.`);
    }
    return textures;
  }

  public createTextPanelTexture(
    message: string,
    options: TextPanelOptions,
  ): THREE.CanvasTexture {
    const requestedLargestEdge = Math.max(options.width, options.height);
    const scale = Math.min(1, this.maximumResolution / requestedLargestEdge);
    const width = Math.max(1, Math.round(options.width * scale));
    const height = Math.max(1, Math.round(options.height * scale));
    const canvas = createCanvas(width, height);
    const context = context2d(canvas);
    const gradient = context.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, options.background);
    gradient.addColorStop(0.48, "#06162d");
    gradient.addColorStop(1, options.background);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.fillStyle = options.accent;
    context.fillRect(0, 0, width, Math.max(1, height * 0.04));
    context.fillRect(
      0,
      height - Math.max(1, height * 0.04),
      width,
      Math.max(1, height * 0.04),
    );
    context.globalAlpha = 0.14;
    for (let x = -height; x < width; x += height / 2) {
      context.beginPath();
      context.moveTo(x, height);
      context.lineTo(x + height * 0.55, 0);
      context.lineWidth = Math.max(1, height * 0.018);
      context.strokeStyle = options.accent;
      context.stroke();
    }
    context.globalAlpha = 1;
    context.fillStyle = options.foreground;
    context.font = `800 ${Math.max(8, Math.round(options.fontPixels * scale))}px system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(message, width / 2, height * 0.52);
    const texture = textureFromCanvas(canvas, THREE.SRGBColorSpace);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.generatedTextTextures.push(texture);
    this.largestAuxiliaryTextureEdge = Math.max(
      this.largestAuxiliaryTextureEdge,
      width,
      height,
    );
    return texture;
  }

  public createContactShadowTexture(): THREE.CanvasTexture {
    const resolution = Math.min(128, this.maximumResolution);
    const center = resolution / 2;
    const canvas = createCanvas(resolution, resolution);
    const context = context2d(canvas);
    const gradient = context.createRadialGradient(
      center,
      center,
      resolution / 32,
      center,
      center,
      resolution * 0.47,
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.82)");
    gradient.addColorStop(0.42, "rgba(0, 0, 0, 0.42)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.clearRect(0, 0, resolution, resolution);
    context.fillStyle = gradient;
    context.fillRect(0, 0, resolution, resolution);
    const texture = textureFromCanvas(canvas, THREE.SRGBColorSpace);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.extraTextures.push(texture);
    this.largestAuxiliaryTextureEdge = Math.max(
      this.largestAuxiliaryTextureEdge,
      resolution,
    );
    return texture;
  }

  public diagnostics(): ProceduralMaterialDiagnostics {
    let largestTextureEdge = 0;
    let textureCount = 0;
    let multiScaleSurfaceCount = 0;
    for (const surface of this.surfaces.values()) {
      largestTextureEdge = Math.max(largestTextureEdge, surface.resolution);
      textureCount += surface.alpha === null ? 3 : 4;
      if (surface.detailScales[1] > surface.detailScales[0]) {
        multiScaleSurfaceCount += 1;
      }
    }
    textureCount +=
      this.generatedTextTextures.length + this.extraTextures.length;
    largestTextureEdge = Math.max(
      largestTextureEdge,
      this.largestAuxiliaryTextureEdge,
    );
    return Object.freeze({
      surfaceNames: PROCEDURAL_SURFACE_NAMES,
      textureCount,
      largestTextureEdge,
      multiScaleSurfaceCount,
      generatedTextTextureCount: this.generatedTextTextures.length,
    });
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    for (const surface of this.surfaces.values()) {
      surface.albedo.dispose();
      surface.normal.dispose();
      surface.roughness.dispose();
      surface.alpha?.dispose();
    }
    for (const texture of this.generatedTextTextures) {
      texture.dispose();
    }
    for (const texture of this.extraTextures) {
      texture.dispose();
    }
  }
}

export function withSurfaceTextures(
  surface: ProceduralSurfaceTextures,
): Pick<
  THREE.MeshStandardMaterialParameters,
  "map" | "normalMap" | "roughnessMap"
> {
  return {
    map: surface.albedo,
    normalMap: surface.normal,
    roughnessMap: surface.roughness,
  };
}

export function withSurfaceAlbedo(
  surface: ProceduralSurfaceTextures,
): Pick<THREE.MeshStandardMaterialParameters, "map"> {
  return {
    map: surface.albedo,
  };
}
