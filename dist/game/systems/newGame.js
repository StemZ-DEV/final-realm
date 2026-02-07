import { nowIso } from "../utils.js";
export function createNewSave(name, slot) {
    const baseStats = {
        strength: 5,
        defense: 5,
        agility: 5,
        intelligence: 5,
        wisdom: 5,
        vitality: 5,
    };
    const player = {
        name,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        gold: 20,
        hp: 70,
        maxHp: 70,
        mp: 10,
        maxMp: 10,
        stats: baseStats,
        attributePoints: 0,
        inventory: [],
        equipment: {},
        status: [],
    };
    const now = nowIso();
    return {
        slot,
        createdAt: now,
        updatedAt: now,
        player,
        quests: { active: [], completed: [] },
        history: [],
        enabledMods: [],
    };
}
