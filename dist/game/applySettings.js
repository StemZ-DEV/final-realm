import chalk from "chalk";
export function applySettings(settings) {
    chalk.level = settings.disableColor ? 0 : 3;
}
