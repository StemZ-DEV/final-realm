export interface Enemy {
	name: string;
	hp: number;
	maxHp: number;
	attack: number;
	xpReward: number;
	goldReward: number;
}

export function getRandomEnemy(): Enemy {
	const monsters: Enemy[] = [
		{
			name: "Slime",
			hp: 10,
			maxHp: 10,
			attack: 2,
			xpReward: 5,
			goldReward: 2,
		},
		{
			name: "Goblin",
			hp: 20,
			maxHp: 20,
			attack: 4,
			xpReward: 10,
			goldReward: 5,
		},
		{
			name: "Wolf",
			hp: 30,
			maxHp: 30,
			attack: 6,
			xpReward: 15,
			goldReward: 8,
		},
	];

	const choice = monsters[Math.floor(Math.random() * monsters.length)];
	return choice;
}
