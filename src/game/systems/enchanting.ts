import type { Enhancement, ItemDefinition, ItemInstance, Rarity, Stats } from "../models.js";
import { randInt } from "../utils.js";
import { applyEnhancement } from "./inventory.js";

const ENCHANT_STATS: Array<keyof Stats> = [
  "strength",
  "defense",
  "agility",
  "vitality",
  "intelligence",
  "wisdom",
];

export function enchantCost(def: ItemDefinition): number {
  const base = def.value;
  const rarityMultiplier = rarityMultiplierValue(def.rarity);
  return Math.max(5, Math.floor(base * 0.5 * rarityMultiplier));
}

export function enchantItem(def: ItemDefinition, instance: ItemInstance): Enhancement {
  const stat = ENCHANT_STATS[randInt(0, ENCHANT_STATS.length - 1)];
  const value = randInt(1, 2) * rarityMultiplierValue(def.rarity);
  const enhancement: Enhancement = { stat, value };
  applyEnhancement(instance, enhancement);
  return enhancement;
}

function rarityMultiplierValue(rarity: Rarity): number {
  switch (rarity) {
    case "legendary":
      return 4;
    case "epic":
      return 3;
    case "rare":
      return 2;
    default:
      return 1;
  }
}
