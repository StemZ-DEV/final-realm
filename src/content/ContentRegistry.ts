import { promises as fs } from "fs";
import path from "path";
import type {
  DifficultyDefinition,
  EnemyDefinition,
  ItemDefinition,
  LootTableDefinition,
  QuestDefinition,
  StatusEffectDefinition,
  VendorDefinition,
  ZoneDefinition,
} from "../game/models.js";

export interface ModManifest {
  id: string;
  name: string;
  version: string;
  author?: string;
  loadOrder?: number;
  override?: boolean;
  contentFiles?: Partial<Record<ContentType, string>>;
  scripts?: string[];
}

export type ContentType =
  | "items"
  | "enemies"
  | "statusEffects"
  | "quests"
  | "vendors"
  | "lootTables"
  | "zones"
  | "difficulty";

export class ContentRegistry {
  items = new Map<string, ItemDefinition>();
  enemies = new Map<string, EnemyDefinition>();
  statusEffects = new Map<string, StatusEffectDefinition>();
  quests = new Map<string, QuestDefinition>();
  vendors = new Map<string, VendorDefinition>();
  lootTables = new Map<string, LootTableDefinition>();
  zones = new Map<string, ZoneDefinition>();
  difficulty: DifficultyDefinition = {
    enemyHpScale: 1,
    enemyAtkScale: 1,
    xpScale: 1,
    goldLossPercent: 0.2,
  };

  async loadCoreContent(basePath: string): Promise<void> {
    const files: Record<ContentType, string> = {
      items: path.join(basePath, "items.json"),
      enemies: path.join(basePath, "enemies.json"),
      statusEffects: path.join(basePath, "statusEffects.json"),
      quests: path.join(basePath, "quests.json"),
      vendors: path.join(basePath, "vendors.json"),
      lootTables: path.join(basePath, "lootTables.json"),
      zones: path.join(basePath, "zones.json"),
      difficulty: path.join(basePath, "difficulty.json"),
    };

    await this.loadContentFile("core", files, false);
  }

  async loadMods(modsPath: string, enabled: string[] | null): Promise<void> {
    let entries: string[] = [];
    try {
      entries = await fs.readdir(modsPath);
    } catch {
      return;
    }

    const manifests: ModManifest[] = [];
    for (const entry of entries) {
      const modDir = path.join(modsPath, entry);
      const modFile = path.join(modDir, "mod.json");
      try {
        const raw = await fs.readFile(modFile, "utf8");
        const manifest = JSON.parse(raw) as ModManifest;
        if (enabled && !enabled.includes(manifest.id)) continue;
        manifests.push(manifest);
      } catch {
        continue;
      }
    }

    manifests.sort((a, b) => (a.loadOrder ?? 0) - (b.loadOrder ?? 0));

    for (const manifest of manifests) {
      const modDir = path.join(modsPath, manifest.id);
      const files = manifest.contentFiles ?? {};
      await this.loadContentFile(manifest.id, files, Boolean(manifest.override), modDir);
    }
  }

  getItem(id: string): ItemDefinition | undefined {
    return this.items.get(id);
  }

  getEnemy(id: string): EnemyDefinition | undefined {
    return this.enemies.get(id);
  }

  getQuest(id: string): QuestDefinition | undefined {
    return this.quests.get(id);
  }

  getVendor(id: string): VendorDefinition | undefined {
    return this.vendors.get(id);
  }

  getLootTable(id: string): LootTableDefinition | undefined {
    return this.lootTables.get(id);
  }

  getZone(id: string): ZoneDefinition | undefined {
    return this.zones.get(id);
  }

  getStatus(id: string): StatusEffectDefinition | undefined {
    return this.statusEffects.get(id);
  }

  private async loadContentFile(
    namespace: string,
    files: Partial<Record<ContentType, string>>,
    allowOverride: boolean,
    basePath?: string
  ): Promise<void> {
    if (files.items) {
      const items = await loadArrayFile<ItemDefinition>(resolvePath(basePath, files.items));
      for (const item of items) {
        const normalized = {
          ...item,
          id: normalizeId(item.id, namespace),
          effects: item.effects?.map((effect) => normalizeId(effect, namespace)),
        };
        if (!allowOverride && this.items.has(normalized.id)) throw new Error(`Duplicate item ${normalized.id}`);
        this.items.set(normalized.id, normalized);
      }
    }

    if (files.statusEffects) {
      const list = await loadArrayFile<StatusEffectDefinition>(resolvePath(basePath, files.statusEffects));
      for (const entry of list) {
        const normalized = { ...entry, id: normalizeId(entry.id, namespace) };
        if (!allowOverride && this.statusEffects.has(normalized.id)) throw new Error(`Duplicate status ${normalized.id}`);
        this.statusEffects.set(normalized.id, normalized);
      }
    }

    if (files.lootTables) {
      const list = await loadArrayFile<LootTableDefinition>(resolvePath(basePath, files.lootTables));
      for (const entry of list) {
        const normalized: LootTableDefinition = {
          ...entry,
          id: normalizeId(entry.id, namespace),
          entries: entry.entries.map((e) => ({
            ...e,
            id: normalizeId(e.id, namespace),
          })),
        };
        if (!allowOverride && this.lootTables.has(normalized.id)) throw new Error(`Duplicate loot table ${normalized.id}`);
        this.lootTables.set(normalized.id, normalized);
      }
    }

    if (files.enemies) {
      const list = await loadArrayFile<EnemyDefinition>(resolvePath(basePath, files.enemies));
      for (const entry of list) {
        const normalized: EnemyDefinition = {
          ...entry,
          id: normalizeId(entry.id, namespace),
          lootTableId: normalizeId(entry.lootTableId, namespace),
          statusResists: normalizeRecordKeys(entry.statusResists, namespace),
        };
        if (!allowOverride && this.enemies.has(normalized.id)) throw new Error(`Duplicate enemy ${normalized.id}`);
        this.enemies.set(normalized.id, normalized);
      }
    }

    if (files.quests) {
      const list = await loadArrayFile<QuestDefinition>(resolvePath(basePath, files.quests));
      for (const entry of list) {
        const normalized: QuestDefinition = {
          ...entry,
          id: normalizeId(entry.id, namespace),
          steps: entry.steps.map((step) => ({
            ...step,
            target: normalizeId(step.target, namespace),
          })),
          rewards: {
            ...entry.rewards,
            items: entry.rewards.items?.map((item) => ({
              ...item,
              id: normalizeId(item.id, namespace),
            })),
          },
        };
        if (!allowOverride && this.quests.has(normalized.id)) throw new Error(`Duplicate quest ${normalized.id}`);
        this.quests.set(normalized.id, normalized);
      }
    }

    if (files.vendors) {
      const list = await loadArrayFile<VendorDefinition>(resolvePath(basePath, files.vendors));
      for (const entry of list) {
        const normalized: VendorDefinition = {
          ...entry,
          id: normalizeId(entry.id, namespace),
          inventoryTableId: normalizeId(entry.inventoryTableId, namespace),
        };
        if (!allowOverride && this.vendors.has(normalized.id)) throw new Error(`Duplicate vendor ${normalized.id}`);
        this.vendors.set(normalized.id, normalized);
      }
    }

    if (files.zones) {
      const list = await loadArrayFile<ZoneDefinition>(resolvePath(basePath, files.zones));
      for (const entry of list) {
        const normalized: ZoneDefinition = {
          ...entry,
          id: normalizeId(entry.id, namespace),
          enemyTables: entry.enemyTables.map((e) => normalizeId(e, namespace)),
        };
        if (!allowOverride && this.zones.has(normalized.id)) throw new Error(`Duplicate zone ${normalized.id}`);
        this.zones.set(normalized.id, normalized);
      }
    }

    if (files.difficulty) {
      const diff = await loadObjectFile<DifficultyDefinition>(resolvePath(basePath, files.difficulty));
      this.difficulty = diff;
    }
  }
}

function normalizeId(id: string, namespace: string): string {
  if (id.includes(":")) return id;
  return `${namespace}:${id}`;
}

function normalizeRecordKeys(record: Record<string, number> | undefined, namespace: string): Record<string, number> | undefined {
  if (!record) return undefined;
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(record)) {
    out[normalizeId(key, namespace)] = value;
  }
  return out;
}

async function loadArrayFile<T>(filePath: string): Promise<T[]> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T[];
}

async function loadObjectFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

function resolvePath(basePath: string | undefined, filePath: string): string {
  return basePath ? path.join(basePath, filePath) : filePath;
}
