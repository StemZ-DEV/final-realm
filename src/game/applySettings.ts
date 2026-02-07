import chalk from "chalk";
import type { Settings } from "./state/SettingsStore.js";

export function applySettings(settings: Settings): void {
  chalk.level = settings.disableColor ? 0 : 3;
}
