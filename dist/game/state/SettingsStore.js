import Conf from "conf";
const DEFAULT_KEYBINDS = {
    up: ["up", "w"],
    down: ["down", "s"],
    left: ["left", "a"],
    right: ["right", "d"],
    confirm: ["enter", "space"],
    cancel: ["escape", "b"],
};
const DEFAULT_SETTINGS = {
    centerView: true,
    disableColor: false,
    highContrast: false,
    reducedMotion: false,
    keybinds: DEFAULT_KEYBINDS,
};
export class SettingsStore {
    conf;
    constructor() {
        this.conf = new Conf({
            projectName: "cli-roguelite",
            configName: "settings",
            fileExtension: "json",
        });
    }
    get() {
        const stored = this.conf.get("settings");
        return stored ? { ...DEFAULT_SETTINGS, ...stored } : { ...DEFAULT_SETTINGS };
    }
    set(next) {
        this.conf.set("settings", next);
    }
    update(partial) {
        const current = this.get();
        const next = { ...current, ...partial };
        this.set(next);
        return next;
    }
}
export const DEFAULT_SETTINGS_EXPORT = DEFAULT_SETTINGS;
