export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type EquipmentSlot = "mainHand" | "offHand" | "armor" | "accessory";

export interface Stats {
  strength: number;
  defense: number;
  agility: number;
  intelligence: number;
  wisdom: number;
  vitality: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  type: "weapon" | "offhand" | "armor" | "accessory" | "consumable" | "material";
  slot?: EquipmentSlot;
  rarity: Rarity;
  stats?: Partial<Stats>;
  durability?: number;
  maxDurability?: number;
  value: number;
  stackable?: boolean;
  effects?: string[];
  description?: string;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  level: number;
  stats: Partial<Stats> & { hp: number };
  lootTableId: string;
  tags?: string[];
  abilities?: string[];
  statusResists?: Record<string, number>;
}

export interface StatusEffectDefinition {
  id: string;
  name: string;
  type: "damage" | "heal" | "buff" | "debuff";
  duration: number;
  stackRule: "refresh" | "stack" | "ignore";
  tickEffect?: { hp?: number; shield?: number };
  onApply?: string;
  onExpire?: string;
}

export interface QuestDefinition {
  id: string;
  name: string;
  type: "bounty" | "delivery" | "collect" | "explore" | "craft";
  description: string;
  steps: Array<{
    target: string;
    count: number;
    progressText?: string;
  }>;
  rewards: {
    gold?: number;
    xp?: number;
    items?: Array<{ id: string; qty: number }>;
  };
}

export interface VendorDefinition {
  id: string;
  name: string;
  inventoryTableId: string;
  services: Array<"repair" | "enchant" | "craft" | "shop">;
}

export interface LootTableDefinition {
  id: string;
  entries: Array<{ id: string; weight: number; min: number; max: number }>;
  rarityBias?: Partial<Record<Rarity, number>>;
}

export interface ZoneDefinition {
  id: string;
  name: string;
  enemyTables: string[];
  eventTables?: string[];
  difficultyBias: number;
}

export interface DifficultyDefinition {
  enemyHpScale: number;
  enemyAtkScale: number;
  xpScale: number;
  goldLossPercent: number;
}

export interface Enhancement {
  stat: keyof Stats;
  value: number;
}

export interface ItemInstance {
  id: string;
  qty: number;
  durability?: number;
  enhancements?: Enhancement[];
}

export interface Equipment {
  mainHand?: ItemInstance;
  offHand?: ItemInstance;
  armor?: ItemInstance;
  accessory?: ItemInstance;
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
  stats: Stats;
  attributePoints: number;
  inventory: ItemInstance[];
  equipment: Equipment;
  status: ActiveStatus[];
}

export interface ActiveStatus {
  id: string;
  remaining: number;
  potency?: number;
}

export interface QuestProgress {
  id: string;
  steps: number[];
  completed: boolean;
}

export interface QuestLog {
  active: QuestProgress[];
  completed: string[];
}

export interface RunHistoryEntry {
  timestamp: string;
  type: "combat" | "loot" | "death" | "quest" | "system";
  text: string;
}

export interface SaveData {
  slot: number;
  createdAt: string;
  updatedAt: string;
  player: Player;
  quests: QuestLog;
  history: RunHistoryEntry[];
  enabledMods: string[];
}

export interface GameState {
  currentSave: SaveData | null;
}
