import type { MatchState } from "../domain/match/state";
import type { Vec2 } from "../domain/math";
import type {
  FeintAction,
  GestureRejectionReason,
  ShotCategory,
  Viewport,
} from "../domain/gesture/model";
import type { ShotOutcome } from "../domain/shot/outcome";

export interface GameHudOptions {
  readonly onRestart: () => void;
  readonly onAudioChanged: (enabled: boolean) => void;
  readonly onReducedMotionChanged: (reducedMotion: boolean) => void;
  readonly audioEnabled: boolean;
  readonly reducedMotion: boolean;
}

export interface GameHudDiagnostics {
  readonly audioEnabled: boolean;
  readonly reducedMotion: boolean;
  readonly firstShotInstructionVisible: boolean;
  readonly roundCompleteVisible: boolean;
  readonly lastPresentedOutcome: ShotOutcome | null;
  readonly outcomePresentations: Readonly<Record<ShotOutcome, number>>;
  readonly rejectedGesturePresentations: number;
  readonly techniqueCategory: ShotCategory;
  readonly techniqueLabel: string;
  readonly feintState: "pending" | "released" | null;
  readonly feintApparentDirection: Vec2 | null;
  readonly safeAreaPanels: readonly string[];
  readonly fictionalHomeTeam: "NOVA AEGIS";
  readonly fictionalAwayTeam: "VOLT UNION";
  readonly fictionalArena: "AURORA FORUM";
}

const OUTCOME_COPY: Readonly<
  Record<ShotOutcome, Readonly<{ title: string; detail: string }>>
> = Object.freeze({
  GOAL: Object.freeze({
    title: "GOAL",
    detail: "Net ignited",
  }),
  SAVED: Object.freeze({
    title: "SAVED",
    detail: "Keeper shield",
  }),
  MISS: Object.freeze({
    title: "MISS",
    detail: "Outside the frame",
  }),
});

export class GameHud {
  public readonly canvas: HTMLCanvasElement;
  private readonly round: HTMLElement;
  private readonly score: HTMLElement;
  private readonly result: HTMLElement;
  private readonly resultDetail: HTMLElement;
  private readonly powerFill: HTMLElement;
  private readonly powerValue: HTMLElement;
  private readonly technique: HTMLElement;
  private readonly hint: HTMLElement;
  private readonly summary: HTMLElement;
  private readonly summaryTitle: HTMLElement;
  private readonly summaryText: HTMLElement;
  private readonly restartButton: HTMLButtonElement;
  private readonly audioButton: HTMLButtonElement;
  private readonly motionButton: HTMLButtonElement;
  private readonly trail: SVGSVGElement;
  private readonly trailGlow: SVGPolylineElement;
  private readonly trailCore: SVGPolylineElement;
  private readonly trailTip: SVGCircleElement;
  private readonly status: HTMLElement;
  private readonly outcomeDots: HTMLElement[];
  private readonly options: GameHudOptions;
  private audioEnabled: boolean;
  private reducedMotion: boolean;
  private lastPresentedOutcome: ShotOutcome | null = null;
  private readonly outcomePresentations: Record<ShotOutcome, number> = {
    GOAL: 0,
    SAVED: 0,
    MISS: 0,
  };
  private rejectedGesturePresentations = 0;
  private techniqueCategory: ShotCategory = "DIRECT";
  private feintState: "pending" | "released" | null = null;
  private feintApparentDirection: Vec2 | null = null;
  private trailVisible = false;
  private trailViewportWidth = 0;
  private trailViewportHeight = 0;

  public constructor(
    private readonly root: HTMLElement,
    options: GameHudOptions,
  ) {
    this.options = options;
    this.audioEnabled = options.audioEnabled;
    this.reducedMotion = options.reducedMotion;
    root.innerHTML = `
      <section class="game-stage" aria-label="Aurora Forum handball penalty game">
        <canvas id="game-canvas" aria-label="Handball penalty court. Swipe upward from the lower part of the game area to shoot."></canvas>
        <svg class="swipe-trail" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <linearGradient id="swipe-energy" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stop-color="#27c9ff" stop-opacity="0.25"></stop>
              <stop offset="0.62" stop-color="#72e9ff"></stop>
              <stop offset="1" stop-color="#ffe39a"></stop>
            </linearGradient>
          </defs>
          <polyline class="swipe-glow"></polyline>
          <polyline class="swipe-core"></polyline>
          <circle class="swipe-tip" r="9"></circle>
        </svg>
        <div class="hud" aria-label="Match status">
          <section class="hud-panel hud-round" data-safe-zone="top-left" aria-label="Round progress">
            <span class="panel-notch" aria-hidden="true"></span>
            <span class="hud-kicker">Penalty round</span>
            <div class="round-row">
              <strong id="hud-round">Shot 1</strong>
              <span class="round-total">/ 5</span>
            </div>
            <div id="hud-progress" class="round-dots" aria-label="No shots taken">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </section>

          <section class="hud-panel hud-score" data-safe-zone="top-center" aria-label="Score">
            <span class="score-team score-team-home">
              <small>Home</small><b>NOVA AEGIS</b>
            </span>
            <strong id="hud-score">0 : 0</strong>
            <span class="score-team score-team-away">
              <small>Away</small><b>VOLT UNION</b>
            </span>
            <span class="arena-tag">Aurora Forum · Arc Seven</span>
          </section>

          <section class="hud-panel hud-technique" data-safe-zone="top-right" aria-label="Technique">
            <span class="hud-kicker">Technique</span>
            <strong id="hud-technique-value">DIRECT</strong>
            <span class="technique-vector" aria-hidden="true">↗</span>
          </section>

          <section class="hud-settings" data-safe-zone="right-edge" aria-label="Accessibility and sound">
            <button id="toggle-audio" class="hud-toggle" type="button">
              <span class="toggle-icon" aria-hidden="true">◖</span>
              <span class="toggle-label">Audio</span>
            </button>
            <button id="toggle-motion" class="hud-toggle" type="button">
              <span class="toggle-icon" aria-hidden="true">◇</span>
              <span class="toggle-label">Motion</span>
            </button>
          </section>

          <section class="hud-panel hud-power" data-safe-zone="bottom-left" aria-label="Shot power">
            <span class="hud-kicker">Release power</span>
            <div class="power-row">
              <strong id="hud-power-value">0%</strong>
              <span class="power-track"><span id="hud-power-fill"></span></span>
            </div>
          </section>

          <section class="hud-panel hud-result" data-safe-zone="bottom-right" aria-live="assertive">
            <span class="hud-kicker">Outcome</span>
            <strong id="hud-result">READY</strong>
            <span id="hud-result-detail" class="result-detail">Five throws · one arena</span>
            <span class="result-reticle" aria-hidden="true">◎</span>
          </section>

          <section id="input-hint" class="input-hint" aria-label="First shot instruction">
            <span class="hint-gesture" aria-hidden="true"><i></i><b>↑</b></span>
            <span><strong>Swipe upward</strong><small>Start in the lower court · direction aims · speed powers</small></span>
          </section>

          <section id="round-summary" class="round-summary" hidden aria-labelledby="summary-title">
            <span class="summary-eyebrow">Aurora Forum · Full time</span>
            <h1 id="summary-title">Round complete</h1>
            <p id="summary-text"></p>
            <div class="summary-actions">
              <button id="restart-round" type="button" aria-label="Restart round">Play another round</button>
            </div>
          </section>
          <p id="app-status" class="sr-only" role="status" aria-live="polite">Loading court</p>
        </div>
      </section>
    `;

    this.canvas = this.required<HTMLCanvasElement>("#game-canvas");
    this.round = this.required("#hud-round");
    this.score = this.required("#hud-score");
    this.result = this.required("#hud-result");
    this.resultDetail = this.required("#hud-result-detail");
    this.powerFill = this.required("#hud-power-fill");
    this.powerValue = this.required("#hud-power-value");
    this.technique = this.required("#hud-technique-value");
    this.hint = this.required("#input-hint");
    this.summary = this.required("#round-summary");
    this.summaryTitle = this.required("#summary-title");
    this.summaryText = this.required("#summary-text");
    this.restartButton = this.required<HTMLButtonElement>("#restart-round");
    this.audioButton = this.required<HTMLButtonElement>("#toggle-audio");
    this.motionButton = this.required<HTMLButtonElement>("#toggle-motion");
    this.trail = this.required<SVGSVGElement>(".swipe-trail");
    this.trailGlow = this.required<SVGPolylineElement>(
      ".swipe-trail .swipe-glow",
    );
    this.trailCore = this.required<SVGPolylineElement>(
      ".swipe-trail .swipe-core",
    );
    this.trailTip = this.required<SVGCircleElement>(".swipe-trail .swipe-tip");
    this.status = this.required("#app-status");
    this.outcomeDots = Array.from(
      this.required("#hud-progress").querySelectorAll<HTMLElement>("span"),
    );
    this.restartButton.addEventListener("click", this.onRestart);
    this.audioButton.addEventListener("click", this.onAudioToggle);
    this.motionButton.addEventListener("click", this.onMotionToggle);
    this.setAudioEnabled(this.audioEnabled);
    this.setReducedMotion(this.reducedMotion);
  }

  public update(
    match: MatchState,
    power: number,
    category: ShotCategory,
    inputEnabled: boolean,
    outcomes: readonly ShotOutcome[],
    roundCompleteVisible: boolean,
    feintState: "pending" | "released" | null,
  ): void {
    const displayShot = Math.min(match.shotsTaken + 1, 5);
    this.round.textContent =
      match.phase === "ROUND_COMPLETE" ? "Complete" : `Shot ${displayShot}`;
    this.score.textContent = `${match.goals} : ${match.saves + match.misses}`;
    this.updateProgress(outcomes);
    this.setTechnique(category, feintState);

    if (match.lastOutcome !== null) {
      const copy = OUTCOME_COPY[match.lastOutcome];
      this.result.textContent = copy.title;
      this.resultDetail.textContent = copy.detail;
    } else if (match.phase === "SHOT_ACTIVE") {
      this.result.textContent = "IN FLIGHT";
      this.resultDetail.textContent = "Standard release";
    } else if (inputEnabled) {
      this.result.textContent = "READY";
      this.resultDetail.textContent = "Read the keeper";
    } else {
      this.result.textContent = "LOCKED";
      this.resultDetail.textContent = "Arena resetting";
    }
    this.result.dataset.outcome = match.lastOutcome ?? "";
    this.root.dataset.matchPhase = match.phase;
    this.root.dataset.inputEnabled = String(inputEnabled);
    this.root.dataset.lastOutcome = match.lastOutcome ?? "";

    const powerPercent = Math.round(power * 100);
    this.powerValue.textContent = `${powerPercent}%`;
    this.powerFill.style.setProperty("--power-percent", `${powerPercent}%`);
    this.hint.hidden = match.shotsTaken > 0 || match.phase !== "READY";

    const roundComplete =
      match.phase === "ROUND_COMPLETE" && roundCompleteVisible;
    this.summary.hidden = !roundComplete;
    this.restartButton.disabled = !roundComplete;
    if (roundComplete) {
      this.summaryTitle.textContent =
        match.goals >= 3 ? "Nova Aegis takes it" : "Volt Union holds firm";
      this.summaryText.textContent =
        `${match.goals} goals · ${match.saves} saved · ${match.misses} wide`;
    }
  }

  public presentShot(
    power: number,
    category: ShotCategory,
    hasFeint = false,
  ): void {
    this.setTechnique(category, hasFeint ? "released" : null);
    this.root.dataset.feedback = "release";
    this.powerFill.dataset.charged = power >= 0.78 ? "true" : "false";
    this.trailGlow.classList.add("is-committed");
    this.trailCore.classList.add("is-committed");
    this.setStatus(
      `${hasFeint ? "FEINT into " : ""}${category} shot released at ${Math.round(power * 100)} percent power.`,
    );
  }

  public presentFeint(feint: FeintAction): void {
    this.feintApparentDirection = feint.apparentDirection;
    this.setTechnique(this.techniqueCategory, "pending");
    this.setStatus("FEINT recognized. Lift your finger to finish the fake, then start a new gesture to shoot.");
  }

  public clearFeint(category: ShotCategory): void {
    this.feintApparentDirection = null;
    this.setTechnique(category, null);
  }

  public presentOutcome(outcome: ShotOutcome): void {
    this.lastPresentedOutcome = outcome;
    this.outcomePresentations[outcome] += 1;
    this.root.dataset.feedback = outcome.toLowerCase();
    this.result.classList.remove("is-impact");
    if (!this.reducedMotion) {
      // Restart the short result beat when consecutive throws share an outcome.
      void this.result.offsetWidth;
      this.result.classList.add("is-impact");
    }
    const copy = OUTCOME_COPY[outcome];
    this.setStatus(`${copy.title}. ${copy.detail}.`);
  }

  public presentRejectedGesture(reason: GestureRejectionReason): void {
    this.rejectedGesturePresentations += 1;
    this.root.dataset.feedback = "rejected";
    this.setStatus(
      `Swipe rejected (${reason}). Start low and swipe upward.`,
    );
  }

  public resetRoundFeedback(): void {
    this.lastPresentedOutcome = null;
    this.outcomePresentations.GOAL = 0;
    this.outcomePresentations.SAVED = 0;
    this.outcomePresentations.MISS = 0;
    this.rejectedGesturePresentations = 0;
    this.feintApparentDirection = null;
    this.setTechnique("DIRECT", null);
    this.result.classList.remove("is-impact");
    this.powerFill.dataset.charged = "false";
    this.root.dataset.feedback = "ready";
  }

  public setStatus(message: string): void {
    this.status.textContent = message;
  }

  public setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
    this.audioButton.setAttribute("aria-pressed", String(enabled));
    this.audioButton.setAttribute(
      "aria-label",
      enabled ? "Mute synthesized audio" : "Enable synthesized audio",
    );
    this.audioButton.dataset.enabled = String(enabled);
    this.audioButton.querySelector(".toggle-label")?.replaceChildren(
      document.createTextNode(enabled ? "Audio on" : "Audio off"),
    );
    this.root.dataset.audioEnabled = String(enabled);
  }

  public setReducedMotion(reducedMotion: boolean): void {
    this.reducedMotion = reducedMotion;
    this.motionButton.setAttribute("aria-pressed", String(reducedMotion));
    this.motionButton.setAttribute(
      "aria-label",
      reducedMotion ? "Enable full motion" : "Reduce motion",
    );
    this.motionButton.dataset.enabled = String(!reducedMotion);
    this.motionButton.querySelector(".toggle-label")?.replaceChildren(
      document.createTextNode(reducedMotion ? "Motion low" : "Motion full"),
    );
    this.root.dataset.reducedMotion = String(reducedMotion);
  }

  public setTrail(points: readonly Vec2[], viewport: Viewport): void {
    // A pointer-down contains only one point and cannot draw a line. Avoid
    // invalidating the full-viewport SVG before the first movement so the
    // live WebGL presentation remains schedulable during pointer capture.
    if (points.length < 2) {
      if (this.trailVisible) {
        this.clearTrail();
      }
      return;
    }
    if (
      this.trailViewportWidth !== viewport.widthPixels ||
      this.trailViewportHeight !== viewport.heightPixels
    ) {
      this.trail.setAttribute(
        "viewBox",
        `0 0 ${viewport.widthPixels} ${viewport.heightPixels}`,
      );
      this.trailViewportWidth = viewport.widthPixels;
      this.trailViewportHeight = viewport.heightPixels;
    }
    const serializedPoints = points
      .map((point) => `${point.x},${point.y}`)
      .join(" ");
    this.trailGlow.setAttribute("points", serializedPoints);
    this.trailCore.setAttribute("points", serializedPoints);
    this.trailGlow.classList.remove("is-committed");
    this.trailCore.classList.remove("is-committed");
    if (!this.trailVisible) {
      this.trailVisible = true;
      this.trail.classList.add("is-active");
      this.trailGlow.classList.add("is-visible");
      this.trailCore.classList.add("is-visible");
      this.trailTip.classList.add("is-visible");
    }
    const tip = points.at(-1);
    if (tip !== undefined) {
      this.trailTip.setAttribute("cx", String(tip.x));
      this.trailTip.setAttribute("cy", String(tip.y));
    }
  }

  public clearTrail(): void {
    if (!this.trailVisible) {
      return;
    }
    this.trailVisible = false;
    this.trail.classList.remove("is-active");
    this.trailGlow.setAttribute("points", "");
    this.trailCore.setAttribute("points", "");
    this.trailGlow.classList.remove("is-visible", "is-committed");
    this.trailCore.classList.remove("is-visible", "is-committed");
    this.trailTip.classList.remove("is-visible");
  }

  public diagnostics(): GameHudDiagnostics {
    return Object.freeze({
      audioEnabled: this.audioEnabled,
      reducedMotion: this.reducedMotion,
      firstShotInstructionVisible: !this.hint.hidden,
      roundCompleteVisible: !this.summary.hidden,
      lastPresentedOutcome: this.lastPresentedOutcome,
      outcomePresentations: Object.freeze({ ...this.outcomePresentations }),
      rejectedGesturePresentations: this.rejectedGesturePresentations,
      techniqueCategory: this.techniqueCategory,
      techniqueLabel: this.technique.textContent ?? this.techniqueCategory,
      feintState: this.feintState,
      feintApparentDirection: this.feintApparentDirection,
      safeAreaPanels: Object.freeze(
        Array.from(
          this.root.querySelectorAll<HTMLElement>("[data-safe-zone]"),
          (element) => element.dataset.safeZone ?? "",
        ).filter((value) => value.length > 0),
      ),
      fictionalHomeTeam: "NOVA AEGIS",
      fictionalAwayTeam: "VOLT UNION",
      fictionalArena: "AURORA FORUM",
    });
  }

  public dispose(): void {
    this.restartButton.removeEventListener("click", this.onRestart);
    this.audioButton.removeEventListener("click", this.onAudioToggle);
    this.motionButton.removeEventListener("click", this.onMotionToggle);
    this.root.replaceChildren();
  }

  private setTechnique(
    category: ShotCategory,
    feintState: "pending" | "released" | null,
  ): void {
    this.techniqueCategory = category;
    this.feintState = feintState;
    if (feintState === null) {
      this.feintApparentDirection = null;
    }
    this.technique.textContent =
      feintState === "pending"
        ? "FEINT"
        : feintState === "released"
          ? `FEINT → ${category}`
          : category;
    this.root.dataset.shotCategory = category;
    this.root.dataset.feintState = feintState ?? "";
    if (this.feintApparentDirection === null) {
      delete this.root.dataset.feintApparentX;
      delete this.root.dataset.feintApparentY;
    } else {
      this.root.dataset.feintApparentX = String(
        this.feintApparentDirection.x,
      );
      this.root.dataset.feintApparentY = String(
        this.feintApparentDirection.y,
      );
    }
  }

  private updateProgress(outcomes: readonly ShotOutcome[]): void {
    for (let index = 0; index < this.outcomeDots.length; index += 1) {
      const dot = this.outcomeDots[index];
      if (dot === undefined) {
        continue;
      }
      const outcome = outcomes[index] ?? null;
      dot.dataset.outcome = outcome ?? "";
      dot.classList.toggle("is-complete", outcome !== null);
    }
    const progress = this.required("#hud-progress");
    progress.setAttribute(
      "aria-label",
      outcomes.length === 0
        ? "No shots taken"
        : outcomes
            .map((outcome, index) => `Shot ${index + 1}: ${outcome}`)
            .join(", "),
    );
  }

  private readonly onRestart = (): void => {
    this.options.onRestart();
  };

  private readonly onAudioToggle = (): void => {
    this.options.onAudioChanged(!this.audioEnabled);
  };

  private readonly onMotionToggle = (): void => {
    this.options.onReducedMotionChanged(!this.reducedMotion);
  };

  private required<ElementType extends Element = HTMLElement>(
    selector: string,
  ): ElementType {
    const element = this.root.querySelector<ElementType>(selector);
    if (element === null) {
      throw new Error(`Required HUD element '${selector}' is missing.`);
    }
    return element;
  }
}
