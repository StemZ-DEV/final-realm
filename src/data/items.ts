import { Item } from "../entities/item";

export const ItemRegistry: Record<string, Item> = {
	/**
	 *
	 *  CONSUMABLES
	 *
	 */

	potion_small: {
		id: "potion_small",
		name: "🧪 Small Potion",
		description: "Restores 10 HP.",
		type: "consumable",
		rarity: "common",
		value: 10,
		use: (player) => {
			const heal = 10;
			const oldHp = player.stats.hp;
			player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + heal);
			return `You used a Small Potion and restored ${player.stats.hp - oldHp} HP.`;
		},
	},

	potion_large: {
		id: "potion_large",
		name: "🧪 Large Potion",
		description: "Restores 25 HP.",
		type: "consumable",
		rarity: "uncommon",
		value: 25,
		use: (player) => {
			const heal = 25;
			const oldHp = player.stats.hp;
			player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + heal);
			return `You used a Large Potion and restored ${player.stats.hp - oldHp} HP.`;
		},
	},

	/**
	 *
	 *  WEAPONS
	 *
	 */

	rusty_dagger: {
		id: "rusty_dagger",
		name: "🗡️  Rusty Dagger",
		description: "A worn-out dagger. Better than using your fists.",
		type: "weapon",
		rarity: "legendary",
		value: 15,
		stats: {
			attack: 2,
			accuracy: -1,
		},
	},

	iron_sword: {
		id: "iron_sword",
		name: "🗡️  Iron Sword",
		description: "A sturdy iron sword. A reliable weapon for any adventurer.",
		type: "weapon",
		rarity: "common",
		value: 50,
		stats: {
			attack: 5,
		},
	},

	/**
	 *
	 *  ARMOURS
	 *
	 */

	leather_tunic: {
		id: "leather_tunic",
		name: "👕 Leather Tunic",
		description: "Offers basic protection.",
		type: "armor",
		rarity: "common",
		value: 20,
		stats: {
			defense: 2,
		},
	},
};

export function getItem(id: string): Item | undefined {
	return ItemRegistry[id];
}

export function getItems(): Item[] {
	return Object.values(ItemRegistry);
}
