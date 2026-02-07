import { promises as fs } from "fs";
import path from "path";
export class ContentRegistry {
    items = new Map();
    enemies = new Map();
    statusEffects = new Map();
    quests = new Map();
    vendors = new Map();
    lootTables = new Map();
    zones = new Map();
    difficulty = {
        enemyHpScale: 1,
        enemyAtkScale: 1,
        xpScale: 1,
        goldLossPercent: 0.2,
    };
    async loadCoreContent(basePath) {
        const files = {
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
    async loadMods(modsPath, enabled) {
        let entries = [];
        try {
            entries = await fs.readdir(modsPath);
        }
        catch {
            return;
        }
        const manifests = [];
        for (const entry of entries) {
            const modDir = path.join(modsPath, entry);
            const modFile = path.join(modDir, "mod.json");
            try {
                const raw = await fs.readFile(modFile, "utf8");
                const manifest = JSON.parse(raw);
                if (enabled && !enabled.includes(manifest.id))
                    continue;
                manifests.push(manifest);
            }
            catch {
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
    getItem(id) {
        return this.items.get(id);
    }
    getEnemy(id) {
        return this.enemies.get(id);
    }
    getQuest(id) {
        return this.quests.get(id);
    }
    getVendor(id) {
        return this.vendors.get(id);
    }
    getLootTable(id) {
        return this.lootTables.get(id);
    }
    getZone(id) {
        return this.zones.get(id);
    }
    getStatus(id) {
        return this.statusEffects.get(id);
    }
    async loadContentFile(namespace, files, allowOverride, basePath) {
        if (files.items) {
            const items = await loadArrayFile(resolvePath(basePath, files.items));
            for (const item of items) {
                const normalized = {
                    ...item,
                    id: normalizeId(item.id, namespace),
                    effects: item.effects?.map((effect) => normalizeId(effect, namespace)),
                };
                if (!allowOverride && this.items.has(normalized.id))
                    throw new Error(`Duplicate item ${normalized.id}`);
                this.items.set(normalized.id, normalized);
            }
        }
        if (files.statusEffects) {
            const list = await loadArrayFile(resolvePath(basePath, files.statusEffects));
            for (const entry of list) {
                const normalized = { ...entry, id: normalizeId(entry.id, namespace) };
                if (!allowOverride && this.statusEffects.has(normalized.id))
                    throw new Error(`Duplicate status ${normalized.id}`);
                this.statusEffects.set(normalized.id, normalized);
            }
        }
        if (files.lootTables) {
            const list = await loadArrayFile(resolvePath(basePath, files.lootTables));
            for (const entry of list) {
                const normalized = {
                    ...entry,
                    id: normalizeId(entry.id, namespace),
                    entries: entry.entries.map((e) => ({
                        ...e,
                        id: normalizeId(e.id, namespace),
                    })),
                };
                if (!allowOverride && this.lootTables.has(normalized.id))
                    throw new Error(`Duplicate loot table ${normalized.id}`);
                this.lootTables.set(normalized.id, normalized);
            }
        }
        if (files.enemies) {
            const list = await loadArrayFile(resolvePath(basePath, files.enemies));
            for (const entry of list) {
                const normalized = {
                    ...entry,
                    id: normalizeId(entry.id, namespace),
                    lootTableId: normalizeId(entry.lootTableId, namespace),
                    statusResists: normalizeRecordKeys(entry.statusResists, namespace),
                };
                if (!allowOverride && this.enemies.has(normalized.id))
                    throw new Error(`Duplicate enemy ${normalized.id}`);
                this.enemies.set(normalized.id, normalized);
            }
        }
        if (files.quests) {
            const list = await loadArrayFile(resolvePath(basePath, files.quests));
            for (const entry of list) {
                const normalized = {
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
                if (!allowOverride && this.quests.has(normalized.id))
                    throw new Error(`Duplicate quest ${normalized.id}`);
                this.quests.set(normalized.id, normalized);
            }
        }
        if (files.vendors) {
            const list = await loadArrayFile(resolvePath(basePath, files.vendors));
            for (const entry of list) {
                const normalized = {
                    ...entry,
                    id: normalizeId(entry.id, namespace),
                    inventoryTableId: normalizeId(entry.inventoryTableId, namespace),
                };
                if (!allowOverride && this.vendors.has(normalized.id))
                    throw new Error(`Duplicate vendor ${normalized.id}`);
                this.vendors.set(normalized.id, normalized);
            }
        }
        if (files.zones) {
            const list = await loadArrayFile(resolvePath(basePath, files.zones));
            for (const entry of list) {
                const normalized = {
                    ...entry,
                    id: normalizeId(entry.id, namespace),
                    enemyTables: entry.enemyTables.map((e) => normalizeId(e, namespace)),
                };
                if (!allowOverride && this.zones.has(normalized.id))
                    throw new Error(`Duplicate zone ${normalized.id}`);
                this.zones.set(normalized.id, normalized);
            }
        }
        if (files.difficulty) {
            const diff = await loadObjectFile(resolvePath(basePath, files.difficulty));
            this.difficulty = diff;
        }
    }
}
function normalizeId(id, namespace) {
    if (id.includes(":"))
        return id;
    return `${namespace}:${id}`;
}
function normalizeRecordKeys(record, namespace) {
    if (!record)
        return undefined;
    const out = {};
    for (const [key, value] of Object.entries(record)) {
        out[normalizeId(key, namespace)] = value;
    }
    return out;
}
async function loadArrayFile(filePath) {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
}
async function loadObjectFile(filePath) {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
}
function resolvePath(basePath, filePath) {
    return basePath ? path.join(basePath, filePath) : filePath;
}
