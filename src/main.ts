import {
  HandballDemoApp,
  type AppPerformanceSnapshot,
  type AppSnapshot,
} from "./app/HandballDemoApp";
import { resolveQualityPreset } from "./core/Quality";
import {
  CAPTURE_SCENES,
  type CaptureSceneDefinition,
  type CaptureSceneName,
} from "./dev/CaptureScenes";
import "./styles.css";

interface DemoTestApi {
  readonly snapshot: () => AppSnapshot;
  readonly restart: () => void;
  readonly exportGestureTrace: () => ReturnType<HandballDemoApp["exportGestureTrace"]>;
}

declare global {
  interface Window {
    __READY__?: boolean;
    __DEMO__?: DemoTestApi;
    __PUMP__?: (frames: number) => void;
    __PRESENT__?: (frames: number) => void;
    __CAPTURE_SCENES__?: readonly CaptureSceneDefinition[];
    __APPLY_CAPTURE_SCENE__?: (name: CaptureSceneName) => AppSnapshot;
    __PERF_SNAPSHOT__?: () => AppPerformanceSnapshot;
  }
}

const root = document.querySelector<HTMLElement>("#app");

if (root === null) {
  throw new Error("Handball demo root element '#app' is missing.");
}

const search = new URLSearchParams(window.location.search);
const captureMode = search.has("capture");
const playtestMode = search.has("playtest");
const traceMode = playtestMode && search.has("trace") && !captureMode;
const seedParameter = search.get("seed");
const requestedSeed = seedParameter === null ? Number.NaN : Number(seedParameter);
const seed = Number.isFinite(requestedSeed) && requestedSeed >= 0
  ? requestedSeed
  : undefined;
const qualityParameter = search.get("quality");
const quality = resolveQualityPreset(
  qualityParameter,
  captureMode ? "capture" : "gameplay",
);
const app = new HandballDemoApp(root, {
  manualTime: captureMode,
  quality,
  recordGestures: traceMode,
  ...(seed === undefined ? {} : { seed }),
});

// Diagnostic controls stay above the lower 45% gesture start zone.
if (traceMode) {
  const panel = document.createElement("div");
  panel.dataset.gestureTrace = "true";
  panel.style.cssText = "position:fixed;top:64px;left:8px;z-index:100;max-width:90vw;max-height:calc(55dvh - 72px);overflow:auto;background:#18202b;color:white;padding:6px;font:12px sans-serif";
  const intent = document.createElement("select");
  intent.setAttribute("aria-label", "Human intended technique");
  for (const value of ["UNLABELLED", "LOB", "ROSCA_LEFT", "ROSCA_RIGHT", "DIRECT", "BOUNCE", "FEINT"]) intent.add(new Option(value, value));
  const partition = document.createElement("select");
  partition.setAttribute("aria-label", "Dataset partition");
  for (const value of ["UNASSIGNED", "CALIBRATION", "HELD_OUT", "SYNTHETIC_DIAGNOSTIC"]) partition.add(new Option(value, value));
  const metadataChanged = () => app.setTraceMetadata(intent.value, partition.value);
  intent.addEventListener("change", metadataChanged);
  partition.addEventListener("change", metadataChanged);
  const download = document.createElement("button");
  download.type = "button";
  download.textContent = "Download local gesture traces";
  download.addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(app.exportGestureTrace(), null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "handball-gesture-traces.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const label = document.createElement("div");
  label.textContent = "Diagnostic recording · human intent / dataset (next attempt)";
  panel.append(label, intent, partition, download);
  root.append(panel);
}

async function startApplication(): Promise<void> {
  await app.start();
  if (import.meta.env.DEV || captureMode || playtestMode) {
    window.__DEMO__ = Object.freeze({
      snapshot: () => app.snapshot(),
      restart: () => app.restart(),
      exportGestureTrace: () => app.exportGestureTrace(),
    });
    window.__PERF_SNAPSHOT__ = () => app.performanceSnapshot();
    if (captureMode) {
      window.__PUMP__ = (frames: number) => app.pumpFrames(frames);
      window.__PRESENT__ = (frames: number) => app.presentFrames(frames);
      window.__CAPTURE_SCENES__ = CAPTURE_SCENES;
      window.__APPLY_CAPTURE_SCENE__ = (name: CaptureSceneName) =>
        app.applyCaptureScene(name);
    }
    window.__READY__ = true;
  }
}

void startApplication().catch((error: unknown) => {
  console.error("Handball demo failed during material/light pre-warm.", error);
  app.dispose();
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.dispose();
    delete window.__READY__;
    delete window.__DEMO__;
    delete window.__PUMP__;
    delete window.__PRESENT__;
    delete window.__CAPTURE_SCENES__;
    delete window.__APPLY_CAPTURE_SCENE__;
    delete window.__PERF_SNAPSHOT__;
  });
}
