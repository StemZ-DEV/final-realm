import Conf from "conf";
export class SaveStore {
    projectName = "cli-roguelite";
    listSlots() {
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
    load(slot) {
        const conf = this.getSlotConf(slot);
        return conf.get("save") ?? null;
    }
    save(slot, data) {
        const conf = this.getSlotConf(slot);
        data.updatedAt = new Date().toISOString();
        conf.set("save", data);
    }
    delete(slot) {
        const conf = this.getSlotConf(slot);
        conf.delete("save");
    }
    getSlotConf(slot) {
        return new Conf({
            projectName: this.projectName,
            configName: `save-${slot}`,
            fileExtension: "json",
        });
    }
}
