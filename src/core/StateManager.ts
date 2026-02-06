import Conf from "conf";
import { Player } from "../interfaces/Player";
import { Engine } from "./Engine";

interface GlobalSettings {
	centerContent: boolean;
}

interface StoreSchema {
	player?: Player;
	lastSaved?: string;
}

export class StateManager {
	private static instance: StateManager;
	private currentSlot: number | null = null;
	private player: Player | null = null;

	private settingsConfig: Conf<GlobalSettings>;
	private settings: GlobalSettings;

	private constructor() {
		this.settingsConfig = new Conf<GlobalSettings>({
			projectName: "final-realm",
			configName: "global-settings",
			fileExtension: "json",
			defaults: {
				centerContent: true,
			},
		});

		this.settings = this.settingsConfig.store;
	}

	public getSettings(): GlobalSettings {
		return this.settings;
	}

	public updateSetting<K extends keyof GlobalSettings>(
		key: K,
		value: GlobalSettings[K],
	): void {
		this.settings[key] = value;
		this.settingsConfig.set(key, value);
	}

	private getSlotConfig(slot: number) {
		return new Conf<StoreSchema>({
			projectName: "final-realm",
			configName: `save-${slot}`,
			fileExtension: "json",
			projectVersion: Engine.getVersion(),
		});
	}

	public static getInstance(): StateManager {
		if (!StateManager.instance) StateManager.instance = new StateManager();
		return StateManager.instance;
	}

	public getSaveSlots() {
		const slots = [];
		for (let i = 1; i <= 5; i++) {
			const config = this.getSlotConfig(i);
			const player = config.get("player");
			slots.push({
				slot: i,
				isEmpty: !player,
				name: player?.name || "Empty Slot",
				level: player?.level || 0,
			});
		}
		return slots;
	}

	public deleteSave(slot: number): void {
		const config = this.getSlotConfig(slot);

		config.clear();

		if (this.currentSlot === slot) {
			this.player = null;
			this.currentSlot = null;
		}
	}

	public createNewGame(name: string, slot: number): void {
		this.currentSlot = slot;
		this.player = {
			name,
			level: 1,
			xp: 0,
			xpToNextLevel: 100,
			gold: 10,
			hp: 20,
			maxHp: 20,
			mp: 10,
			maxMp: 10,
			attributes: {
				strength: 5,
				health: 5,
				speed: 5,
				evasion: 5,
				accuracy: 5,
				defense: 5,
				intelligence: 5,
				wisdom: 5,
			},
			attributePoints: 10,
			equipment: {},
			inventory: [],
		};
		this.save();
	}

	public getPlayer(): Player | null {
		return this.player;
	}

	public save(): void {
		if (this.player && this.currentSlot) {
			const config = this.getSlotConfig(this.currentSlot);
			config.set("player", this.player);
			config.set("lastSaved", new Date().toISOString());
		}
	}

	public load(slot: number): boolean {
		const config = this.getSlotConfig(slot);
		const savedPlayer = config.get("player");
		if (savedPlayer) {
			this.player = savedPlayer as Player;
			this.currentSlot = slot;
			return true;
		}
		return false;
	}
}

export const State = StateManager.getInstance();
