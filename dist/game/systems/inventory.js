export function createItemInstance(def, qty = 1) {
    const durability = def.maxDurability ?? def.durability;
    const instance = {
        id: def.id,
        qty,
    };
    if (durability !== undefined)
        instance.durability = durability;
    if (def.type !== "consumable" && def.type !== "material" && def.stats) {
        instance.enhancements = [];
    }
    return instance;
}
export function addItem(player, registry, itemId, qty) {
    const def = registry.getItem(itemId);
    if (!def)
        return;
    if (def.stackable) {
        const existing = player.inventory.find((entry) => entry.id === itemId);
        if (existing) {
            existing.qty += qty;
            return;
        }
    }
    for (let i = 0; i < qty; i++) {
        player.inventory.push(createItemInstance(def, def.stackable ? qty : 1));
        if (def.stackable)
            break;
    }
}
export function removeItem(player, itemId, qty) {
    let remaining = qty;
    for (let i = player.inventory.length - 1; i >= 0 && remaining > 0; i--) {
        const entry = player.inventory[i];
        if (entry.id !== itemId)
            continue;
        if (entry.qty > remaining) {
            entry.qty -= remaining;
            return true;
        }
        remaining -= entry.qty;
        player.inventory.splice(i, 1);
    }
    return remaining <= 0;
}
export function equipItem(player, registry, index) {
    const entry = player.inventory[index];
    if (!entry)
        return null;
    const def = registry.getItem(entry.id);
    if (!def || !def.slot)
        return "Item cannot be equipped.";
    const slot = def.slot;
    const current = player.equipment[slot];
    if (current)
        player.inventory.push(current);
    player.equipment[slot] = entry;
    player.inventory.splice(index, 1);
    return null;
}
export function unequipItem(player, slot) {
    const entry = player.equipment[slot];
    if (!entry)
        return;
    player.inventory.push(entry);
    delete player.equipment[slot];
}
export function getItemValue(def, instance) {
    const base = def.value;
    const enchant = instance?.enhancements?.reduce((sum, e) => sum + Math.abs(e.value) * 5, 0) ?? 0;
    return Math.max(1, Math.floor(base + enchant));
}
export function applyEnhancement(instance, enhancement) {
    if (!instance.enhancements)
        instance.enhancements = [];
    instance.enhancements.push(enhancement);
}
