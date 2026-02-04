import { Player, PlayerStats } from "./player";

export type ItemType = "consumable" | "weapon" | "armor" | "misc";
export type ItemRarity = "common" | "uncommon" | "rare" | "legendary";

export interface Item {
    id: string;
    name: string;
    description: string;
    type: ItemType;
    rarity: ItemRarity;
    value: number;

    use?: (player: Player) => string;

    stats?: Partial<PlayerStats>;
}