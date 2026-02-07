export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function weightedPick(items) {
    const total = items.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * total;
    for (const entry of items) {
        if (roll < entry.weight)
            return entry.item;
        roll -= entry.weight;
    }
    return items[items.length - 1].item;
}
export function nowIso() {
    return new Date().toISOString();
}
