import { randInt } from "../utils.js";
import { addItem } from "./inventory.js";
export function computePlayerStats(player, registry) {
    const bonus = {
        strength: 0,
        defense: 0,
        agility: 0,
        intelligence: 0,
        wisdom: 0,
        vitality: 0,
    };
    const equipment = Object.values(player.equipment);
    for (const entry of equipment) {
        if (!entry)
            continue;
        const def = registry.getItem(entry.id);
        if (!def || !def.stats)
            continue;
        applyStats(bonus, def.stats);
        if (entry.enhancements) {
            for (const enh of entry.enhancements) {
                const key = enh.stat;
                bonus[key] += enh.value;
            }
        }
    }
    const total = {
        strength: player.stats.strength + bonus.strength,
        defense: player.stats.defense + bonus.defense,
        agility: player.stats.agility + bonus.agility,
        intelligence: player.stats.intelligence + bonus.intelligence,
        wisdom: player.stats.wisdom + bonus.wisdom,
        vitality: player.stats.vitality + bonus.vitality,
    };
    const attack = total.strength * 2 + Math.floor(total.agility / 2);
    const defense = total.defense * 2 + Math.floor(total.vitality / 2);
    const maxHp = 20 + total.vitality * 10;
    return { stats: total, attack, defense, maxHp };
}
export function createEnemyInstance(def, difficultyBias, playerLevel, variant, difficulty) {
    const scale = 1 + difficultyBias + playerLevel * 0.05;
    const baseStats = normalizeStats(def.stats);
    const stats = {
        strength: Math.round((baseStats.strength + playerLevel * 0.2) * difficulty.enemyAtkScale),
        defense: Math.round((baseStats.defense + playerLevel * 0.2) * difficulty.enemyAtkScale),
        agility: baseStats.agility,
        intelligence: baseStats.intelligence,
        wisdom: baseStats.wisdom,
        vitality: baseStats.vitality,
    };
    let hp = Math.round(def.stats.hp * scale * difficulty.enemyHpScale);
    if (variant === "elite")
        hp = Math.round(hp * 1.4);
    if (variant === "boss")
        hp = Math.round(hp * 2);
    return {
        id: def.id,
        name: def.name,
        level: Math.max(1, Math.round(def.level + difficultyBias * 2 + playerLevel * 0.3)),
        hp,
        maxHp: hp,
        stats,
        status: [],
        lootTableId: def.lootTableId,
        variant,
    };
}
export function attackDamage(attacker, defender) {
    const variance = randInt(-2, 2);
    const raw = attacker.attack - defender.defense + variance;
    return Math.max(1, raw);
}
export function applyDamage(target, amount) {
    const dmg = Math.max(0, Math.floor(amount));
    target.hp = Math.max(0, target.hp - dmg);
    return dmg;
}
export function applyHeal(target, amount) {
    const heal = Math.max(0, Math.floor(amount));
    target.hp = Math.min(target.maxHp, target.hp + heal);
    return heal;
}
export function tickStatuses(target, registry, log) {
    const remaining = [];
    for (const status of target.status) {
        const def = registry.getStatus(status.id);
        if (!def)
            continue;
        if (def.tickEffect?.hp) {
            if (def.tickEffect.hp < 0) {
                const dmg = applyDamage(target, Math.abs(def.tickEffect.hp));
                log(`${def.name} deals ${dmg} damage.`);
            }
            else {
                const heal = applyHeal(target, def.tickEffect.hp);
                log(`${def.name} heals ${heal} HP.`);
            }
        }
        status.remaining -= 1;
        if (status.remaining > 0)
            remaining.push(status);
        else
            log(`${def.name} fades.`);
    }
    target.status = remaining;
}
export function applyStatus(target, statusId, duration) {
    const existing = target.status.find((s) => s.id === statusId);
    if (existing) {
        existing.remaining = Math.max(existing.remaining, duration);
        return;
    }
    target.status.push({ id: statusId, remaining: duration });
}
export function consumeItem(player, registry, item) {
    const def = registry.getItem(item.id);
    if (!def)
        return "";
    if (!def.effects || def.effects.length === 0)
        return "Nothing happens.";
    for (const effectId of def.effects) {
        applyStatus(player, effectId, registry.getStatus(effectId)?.duration ?? 2);
    }
    item.qty -= 1;
    return `${def.name} used.`;
}
export function grantLoot(player, registry, lootTableId, log) {
    const table = registry.getLootTable(lootTableId);
    if (!table)
        return;
    const entry = weightedLoot(table.entries);
    const amount = randInt(entry.min, entry.max);
    addItem(player, registry, entry.id, amount);
    const def = registry.getItem(entry.id);
    log(`Loot: ${amount}x ${def?.name ?? entry.id}`);
}
function weightedLoot(entries) {
    const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * total;
    for (const entry of entries) {
        if (roll < entry.weight)
            return entry;
        roll -= entry.weight;
    }
    return entries[entries.length - 1];
}
function normalizeStats(partial) {
    return {
        strength: partial.strength ?? 1,
        defense: partial.defense ?? 1,
        agility: partial.agility ?? 1,
        intelligence: partial.intelligence ?? 1,
        wisdom: partial.wisdom ?? 1,
        vitality: partial.vitality ?? 1,
    };
}
function applyStats(target, extra) {
    target.strength += extra.strength ?? 0;
    target.defense += extra.defense ?? 0;
    target.agility += extra.agility ?? 0;
    target.intelligence += extra.intelligence ?? 0;
    target.wisdom += extra.wisdom ?? 0;
    target.vitality += extra.vitality ?? 0;
}
