import type { ContentRegistry } from "../../content/ContentRegistry.js";
import type { ZoneDefinition } from "../models.js";
import { randInt, weightedPick } from "../utils.js";

export type EncounterRoll =
  | { type: "event"; message: string }
  | { type: "encounter"; enemyId: string; variant: "normal" | "elite" | "boss" | "ambush" };

export function rollEncounter(zone: ZoneDefinition, registry: ContentRegistry): EncounterRoll {
  const encounterChance = 0.7;
  if (Math.random() > encounterChance) {
    const event = randInt(1, 3);
    if (event === 1) return { type: "event", message: "You find a quiet clearing and rest." };
    if (event === 2) return { type: "event", message: "You stumble on scattered coins." };
    return { type: "event", message: "Nothing stirs in the shadows." };
  }

  const variantRoll = Math.random();
  const variant = variantRoll > 0.9 ? "boss" : variantRoll > 0.7 ? "elite" : "normal";
  const tableId = zone.enemyTables[randInt(0, zone.enemyTables.length - 1)];
  const table = registry.getLootTable(tableId);
  if (!table) {
    return { type: "event", message: "The path is eerily quiet." };
  }
  const entry = weightedPick(table.entries.map((e) => ({ item: e, weight: e.weight })));
  return { type: "encounter", enemyId: entry.id, variant };
}
