import readline from "readline";
import { Engine } from "./Engine";
import chalk from "chalk";

export type KeySignal = "up" | "down" | "confirm" | "back";

export class Input {
    static async getNavigation(): Promise<KeySignal> {
        return new Promise((resolve) => {
            const onKey = (_: string, key: any) => {
                if (key.ctrl && key.name === "c") Engine.stop();

                switch (key.name) {
                    case "up":
                    case "w":
                        resolve("up");
                        break;

                    case "down":
                    case "s":
                        resolve("down");
                        break;

                    case "return":
                    case "enter":
                        resolve("confirm");

                    case "escape":
                    case "b":
                        resolve("back");
                        break;

                    default:
                        process.stdin.once("keypress", onKey);
                }
            };

            process.stdin.once("keypress", onKey);
        })
    }

    static async readText(prompt: string): Promise<string> {
        if (process.stdin.isTTY)
            process.stdin.setRawMode(false);
        process.stdin.pause();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        return new Promise((resolve) => {
            rl.question(chalk.green("? ") + chalk.white.bold(prompt) + " ", (answer) => {
                rl.close();

                if (process.stdin.isTTY)
                    process.stdin.setRawMode(true);
                process.stdin.resume();
                readline.emitKeypressEvents(process.stdin);
                resolve(answer.trim() || "Unknown");
            });
        });
    }
}