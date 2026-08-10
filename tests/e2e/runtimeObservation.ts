import type { Page, Request } from "@playwright/test";

export interface RuntimeObservation {
  readonly errors: string[];
  readonly requests: string[];
}

export function observeRuntime(page: Page): RuntimeObservation {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });
  page.on("request", (request: Request) => {
    requests.push(request.url());
  });
  return { errors, requests };
}

export function expectNoRuntimeErrors(observation: RuntimeObservation): void {
  if (observation.errors.length > 0) {
    throw new Error(
      `Runtime console/page errors were observed: ${JSON.stringify(observation.errors)}`,
    );
  }
}

export function auditProductionRequests(
  requests: readonly string[],
  baseUrl = "http://127.0.0.1:4173",
): readonly string[] {
  const base = new URL(baseUrl);
  const allowedPaths = new Set<string>();

  for (const value of requests) {
    const url = new URL(value);
    if (url.origin !== base.origin) {
      throw new Error(`External runtime request detected: ${value}`);
    }
    if (
      url.pathname !== "/" &&
      !url.pathname.endsWith(".js") &&
      !url.pathname.endsWith(".css")
    ) {
      throw new Error(`Runtime media/data request detected: ${value}`);
    }
    allowedPaths.add(url.pathname);
  }

  if (!allowedPaths.has("/")) {
    throw new Error("Production document request was not observed.");
  }
  if (![...allowedPaths].some((path) => path.endsWith(".js"))) {
    throw new Error("Production JavaScript bundle request was not observed.");
  }
  return Object.freeze([...allowedPaths].sort());
}
