import Conf from "conf";
import type { SaveData } from "../models.js";

interface SaveSchema {
  save?: SaveData;
}

export class SaveStore {
  private projectName = "cli-roguelite";

  listSlots(): Array<{ slot: number; isEmpty: boolean; name: string; level: number }>{
    const slots = [];
    for (let i = 1; i <= 5; i++) {
      const conf = this.getSlotConf(i);
      const save = conf.get("save");
      slots.push({
        slot: i,
        isEmpty: !save,
        name: save?.player.name ?? "Empty Slot",
        level: save?.player.level ?? 0,
      });
    }
    return slots;
  }

  load(slot: number): SaveData | null {
    const conf = this.getSlotConf(slot);
    return conf.get("save") ?? null;
  }

  save(slot: number, data: SaveData): void {
    const conf = this.getSlotConf(slot);
    data.updatedAt = new Date().toISOString();
    conf.set("save", data);
  }

  delete(slot: number): void {
    const conf = this.getSlotConf(slot);
    conf.delete("save");
  }

  private getSlotConf(slot: number): Conf<SaveSchema> {
    return new Conf<SaveSchema>({
      projectName: this.projectName,
      configName: `save-${slot}`,
      fileExtension: "json",
    });
  }
}
