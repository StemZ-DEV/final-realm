import { Attributes } from "./Player";

export type ItemType = "weapon" | "armor" | "accessory" | "consumable" | "material";
export type Rarity = "common" | "uncommon" | "rare" | "legendary";
export type EquipmentSlot = "primary" | "secondary" | "armor" | "accessory";

export interface Item {
    id: string;
    name: string;
    type: ItemType;
    description: string;
    rarity: Rarity;
    value: number;

    slot?: EquipmentSlot;

    stats?: Partial<Attributes>;
    damage?: number;
    armor?: number;

    effect?: (player: any) => void;
}

export interface Enemy {
    id: string;
    name: string;
    level: number;
    xpReward: number;
    goldReward: { min: number, max: number };
    attributes: Attributes;

    traits: ("aggressive" | "defensive" | "undead")[];
}