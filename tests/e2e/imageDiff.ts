import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

export interface ExactPngDiff {
  readonly matches: boolean;
  readonly expectedSha256: string;
  readonly actualSha256: string;
  readonly expectedBytes: number;
  readonly actualBytes: number;
  readonly differingBytes: number;
  readonly firstDifferingByte: number | null;
  readonly width: number;
  readonly height: number;
}

export interface BaselineWriteDecision {
  readonly baselineExists: boolean;
  readonly explicitUpdate: boolean;
  readonly currentRepeatMatches: boolean;
  readonly priorBaselineCreatedByFailedRepeat: boolean;
  readonly baselineRequiresHarnessMigration: boolean;
}

export function shouldWritePngBaseline(
  decision: BaselineWriteDecision,
): boolean {
  if (!decision.currentRepeatMatches) {
    return false;
  }
  return (
    decision.explicitUpdate ||
    !decision.baselineExists ||
    decision.priorBaselineCreatedByFailedRepeat ||
    decision.baselineRequiresHarnessMigration
  );
}

export function compareExactPng(
  expected: Buffer,
  actual: Buffer,
): ExactPngDiff {
  const expectedSize = pngSize(expected);
  const actualSize = pngSize(actual);
  if (
    expectedSize.width !== actualSize.width ||
    expectedSize.height !== actualSize.height
  ) {
    throw new Error(
      `PNG dimensions differ: expected ${expectedSize.width}x${expectedSize.height}, ` +
        `received ${actualSize.width}x${actualSize.height}.`,
    );
  }

  const sharedLength = Math.min(expected.length, actual.length);
  let differingBytes = Math.abs(expected.length - actual.length);
  let firstDifferingByte: number | null = null;
  for (let index = 0; index < sharedLength; index += 1) {
    if (expected[index] === actual[index]) {
      continue;
    }
    differingBytes += 1;
    firstDifferingByte ??= index;
  }
  if (firstDifferingByte === null && expected.length !== actual.length) {
    firstDifferingByte = sharedLength;
  }

  return Object.freeze({
    matches: differingBytes === 0,
    expectedSha256: sha256(expected),
    actualSha256: sha256(actual),
    expectedBytes: expected.length,
    actualBytes: actual.length,
    differingBytes,
    firstDifferingByte,
    width: expectedSize.width,
    height: expectedSize.height,
  });
}

export function comparePngFile(
  expectedPath: string,
  actual: Buffer,
): ExactPngDiff {
  return compareExactPng(readFileSync(expectedPath), actual);
}

export function writePng(path: string, png: Buffer): void {
  pngSize(png);
  writeFileSync(path, png);
}

function pngSize(png: Buffer): Readonly<{ width: number; height: number }> {
  if (
    png.length < 24 ||
    !png.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) ||
    png.toString("ascii", 12, 16) !== "IHDR"
  ) {
    throw new Error("Image comparison input is not a valid PNG header.");
  }
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width < 1 || height < 1) {
    throw new Error(`PNG dimensions must be positive, received ${width}x${height}.`);
  }
  return Object.freeze({ width, height });
}

function sha256(value: Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}
