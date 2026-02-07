import { randInt } from "../utils.js";
import { getItemValue } from "./inventory.js";
export function generateVendorStock(registry, vendor) {
    const table = registry.getLootTable(vendor.inventoryTableId);
    if (!table)
        return [];
    return table.entries.map((entry) => {
        const def = registry.getItem(entry.id);
        const qty = randInt(entry.min, entry.max);
        const price = def ? Math.max(1, Math.floor(def.value * 1.2)) : 1;
        return { itemId: entry.id, qty, price };
    });
}
export function sellPrice(def, instance) {
    return Math.max(1, Math.floor(getItemValue(def, instance) * 0.5));
}
