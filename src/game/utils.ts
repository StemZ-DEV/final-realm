export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function weightedPick<T>(items: Array<{ item: T; weight: number }>): T {
  const total = items.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of items) {
    if (roll < entry.weight) return entry.item;
    roll -= entry.weight;
  }
  return items[items.length - 1].item;
}

export function nowIso(): string {
  return new Date().toISOString();
}
