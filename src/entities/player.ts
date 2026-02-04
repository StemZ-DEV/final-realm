export interface PlayerStats {
	hp: number;
	maxHp: number;
	mp: number;
	maxMp: number;
	attack: number;
	defense: number;

	magic: number;
	speed: number;
	accuracy: number;
	evasion: number;
	critChance: number;
}

export interface Player {
	name: string;
	level: number;
	xp: number;
	maxXp: number;
	gold: number;
	stats: PlayerStats;
	inventory: string[];
	equipment: {
		mainHand?: string;
		armor?: string;
	};
}

export function createPlayer(name: string): Player {
	return {
		name,
		level: 1,
		xp: 0,
		maxXp: 100,
		gold: 0,
		stats: {
			hp: 20,
			maxHp: 20,
			mp: 10,
			maxMp: 10,
			attack: 3,
			defense: 1,

			magic: 2,
			speed: 2,
			accuracy: 20,
			evasion: 15,
			critChance: 0.2,
		},
		inventory: ["potion_small", "rusty_dagger", "leather_tunic"],
		equipment: {
			mainHand: undefined,
			armor: undefined,
		},
	};
}
