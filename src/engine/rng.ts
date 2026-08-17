// Seeded, serializable RNG (mulberry32). Narrative systems must never call
// Math.random(): the RNG state is stored in the save so reloading cannot
// reroll delayed consequences or card selection.

export function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^= h >>> 16) >>> 0;
}

export class Rng {
  private state: number;

  constructor(state: number) {
    this.state = state >>> 0;
  }

  static fromSeed(seed: string): Rng {
    return new Rng(hashSeed(seed));
  }

  getState(): number {
    return this.state;
  }

  /** [0, 1) */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** integer in [min, max] inclusive */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** weighted pick; weights must be positive */
  weighted<T>(items: T[], weightOf: (item: T) => number): T {
    let total = 0;
    for (const it of items) total += Math.max(0.0001, weightOf(it));
    let roll = this.next() * total;
    for (const it of items) {
      roll -= Math.max(0.0001, weightOf(it));
      if (roll <= 0) return it;
    }
    return items[items.length - 1];
  }
}

export function makeRunSeed(): string {
  // Only used at run creation (outside deterministic narrative flow).
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}
