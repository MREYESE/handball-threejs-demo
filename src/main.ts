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
  ...(seed === undefined ? {} : { seed }),
});

async function startApplication(): Promise<void> {
  await app.start();
  if (import.meta.env.DEV || captureMode || playtestMode) {
    window.__DEMO__ = Object.freeze({
      snapshot: () => app.snapshot(),
      restart: () => app.restart(),
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
