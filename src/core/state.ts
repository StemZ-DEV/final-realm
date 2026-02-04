import Conf from "conf";
import { Player, createPlayer } from "../entities/player";

interface GameSaveData {
    player: Player;
    lastSaved: string;
}

let currentConfig: Conf<GameSaveData> | null = null;
let currentSlot: number = 0;

export const GameState = {
    selectSlot(slot: number) {
        currentSlot = slot;
        currentConfig = new Conf<GameSaveData>({
            projectName: "final-realm-rpg",
            configName: `save_slot_${slot}`
        });
    },

    saveExists(slot: number): boolean {
        const tmp = new Conf<GameSaveData>({
            projectName: "final-realm-rpg",
            configName: `save_slot_${slot}`
        });
        return tmp.has("player");
    },

    getPreview(slot: number): string {
        if (!this.saveExists(slot)) return "Empty Slot";

        const tmp = new Conf<GameSaveData>({
            projectName: "final-realm-rpg",
            configName: `save_slot_${slot}`
        });

        const p = tmp.get("player");
        return `${p.name} (Lvl ${p.level}) - ${tmp.get("lastSaved").split("T")[0]}`;
    },

    getPlayer(): Player {
        if (!currentConfig) throw new Error("No save slot selected!");
        return currentConfig.get("player")!;
    },

    savePlayer(player: Player) {
        if (!currentConfig) throw new Error("No save slot selected!");
        currentConfig.set("player", player);
        currentConfig.set("lastSaved", new Date().toISOString());
    },

    createNewGame(slot: number, name: string) {
        this.selectSlot(slot);
        const newPlayer = createPlayer(name);
        this.savePlayer(newPlayer);
    },

    deleteSave(slot: number) {
        const tmp = new Conf<GameSaveData>({
            projectName: "final-realm-rpg",
            configName: `save_slot_${slot}`
        
        });
        tmp.clear();
    }
};