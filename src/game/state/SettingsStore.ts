import Conf from "conf";
import type { Keybinds } from "../../engine/types.js";

export interface Settings {
  centerView: boolean;
  disableColor: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  keybinds: Keybinds;
}

const DEFAULT_KEYBINDS: Keybinds = {
  up: ["up", "w"],
  down: ["down", "s"],
  left: ["left", "a"],
  right: ["right", "d"],
  confirm: ["enter", "space"],
  cancel: ["escape", "b"],
};

const DEFAULT_SETTINGS: Settings = {
  centerView: true,
  disableColor: false,
  highContrast: false,
  reducedMotion: false,
  keybinds: DEFAULT_KEYBINDS,
};

interface SettingsSchema {
  settings?: Settings;
}

export class SettingsStore {
  private conf: Conf<SettingsSchema>;

  constructor() {
    this.conf = new Conf<SettingsSchema>({
      projectName: "cli-roguelite",
      configName: "settings",
      fileExtension: "json",
    });
  }

  get(): Settings {
    const stored = this.conf.get("settings");
    return stored ? { ...DEFAULT_SETTINGS, ...stored } : { ...DEFAULT_SETTINGS };
  }

  set(next: Settings): void {
    this.conf.set("settings", next);
  }

  update(partial: Partial<Settings>): Settings {
    const current = this.get();
    const next = { ...current, ...partial };
    this.set(next);
    return next;
  }
}

export const DEFAULT_SETTINGS_EXPORT = DEFAULT_SETTINGS;
