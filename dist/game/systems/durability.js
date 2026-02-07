export function degradeEquipment(player) {
    for (const slot of ["mainHand", "offHand", "armor"]) {
        const item = player.equipment[slot];
        if (!item || item.durability === undefined)
            continue;
        item.durability = Math.max(0, item.durability - 1);
    }
}
export function repairCost(def, instance) {
    const max = def.maxDurability ?? def.durability ?? 0;
    const current = instance.durability ?? max;
    const missing = Math.max(0, max - current);
    return Math.max(1, Math.floor(missing * (def.value * 0.1)));
}
export function repairItem(def, instance) {
    const max = def.maxDurability ?? def.durability ?? instance.durability ?? 0;
    instance.durability = max;
}
