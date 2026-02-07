import type { ContentRegistry } from "../../content/ContentRegistry.js";
import type { ItemDefinition, ItemInstance, VendorDefinition } from "../models.js";
import { randInt } from "../utils.js";
import { getItemValue } from "./inventory.js";

export interface VendorStockEntry {
  itemId: string;
  qty: number;
  price: number;
}

export function generateVendorStock(registry: ContentRegistry, vendor: VendorDefinition): VendorStockEntry[] {
  const table = registry.getLootTable(vendor.inventoryTableId);
  if (!table) return [];
  return table.entries.map((entry) => {
    const def = registry.getItem(entry.id);
    const qty = randInt(entry.min, entry.max);
    const price = def ? Math.max(1, Math.floor(def.value * 1.2)) : 1;
    return { itemId: entry.id, qty, price };
  });
}

export function sellPrice(def: ItemDefinition, instance?: ItemInstance): number {
  return Math.max(1, Math.floor(getItemValue(def, instance) * 0.5));
}
