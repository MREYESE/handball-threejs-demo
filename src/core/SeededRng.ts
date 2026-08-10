const UINT32_RANGE = 0x1_0000_0000;
const GOLDEN_INCREMENT = 0x6d2b_79f5;

function hashLabel(seed: number, label: string): number {
  let hash = (seed ^ 0x811c_9dc5) >>> 0;
  for (let index = 0; index < label.length; index += 1) {
    hash ^= label.charCodeAt(index);
    hash = Math.imul(hash, 0x0100_0193) >>> 0;
  }
  return hash;
}

export class SeededRng {
  private state: number;

  public constructor(private readonly initialSeed: number) {
    if (!Number.isFinite(initialSeed)) {
      throw new RangeError("RNG seed must be finite.");
    }
    this.state = initialSeed >>> 0;
  }

  public nextUint32(): number {
    this.state = (this.state + GOLDEN_INCREMENT) >>> 0;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return (value ^ (value >>> 14)) >>> 0;
  }

  public nextFloat(): number {
    return this.nextUint32() / UINT32_RANGE;
  }

  public nextInt(exclusiveMaximum: number): number {
    if (!Number.isInteger(exclusiveMaximum) || exclusiveMaximum < 1) {
      throw new RangeError("RNG integer bound must be a positive integer.");
    }
    return Math.floor(this.nextFloat() * exclusiveMaximum);
  }

  public fork(label: string): SeededRng {
    return new SeededRng(hashLabel(this.initialSeed >>> 0, label));
  }
}
