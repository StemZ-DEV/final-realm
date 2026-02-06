export interface Attributes {
    // Physical
    strength: number;       // Raw power (physical damage)
    health: number;         // Max HP

    // Mobility
    speed: number;          // Turn Priority
    evasion: number;        // Evasion / dodge chance

    // Technical
    accuracy: number;       // Accuracy / crit hit chance
    defense: number;        // Status resistence / defense

    // Magic/Mental
    intelligence: number;   // Magic Damage / spell power
    wisdom: number;         // Max MP / Magic Resist
}

export interface Equipment {
    primary?: string;
    secondary?: string;
    armor?: string;
    accessory?: string;
}

export interface Player {
    name: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    gold: number;

    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;

    attributes: Attributes;
    attributePoints: number;

    equipment: Equipment;

    inventory: {
        id: string,
        quantity: number;
    }[];
}