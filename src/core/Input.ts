import readline from "readline";
import { Engine } from "./Engine";
import chalk from "chalk";
import { Renderer } from "../ui/Renderer";

export type KeySignal = "up" | "down" | "confirm" | "back" | "resize";

export class Input {
	static async getNavigation(): Promise<KeySignal> {
		return new Promise((resolve) => {
			const stdin = process.stdin;

			const onKey = (_: string, key: any) => {
				if (key.ctrl && key.name === "c") Engine.stop();

				let signal: KeySignal | null = null;

				switch (key.name) {
					case "up":
					case "w":
						signal = "up";
						break;
					case "down":
					case "s":
						signal = "down";
						break;
					case "return":
					case "enter":
						signal = "confirm";
						break;
					case "escape":
					case "b":
						signal = "back";
						break;
				}

				if (signal) {
					cleanup();
					resolve(signal);
				}
			};

			const onResize = () => {
				cleanup();
				resolve("resize");
			};

			const cleanup = () => {
				stdin.removeListener("keypress", onKey);
				process.removeListener("SIGWINCH", onResize);
			};

			process.on("SIGWINCH", onResize);
			stdin.on("keypress", onKey);
		});
	}

	static async readText(
		prompt: string,
		defaultValue?: string,
	): Promise<string> {
		if (process.stdin.isTTY) process.stdin.setRawMode(false);
		process.stdin.pause();

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		const promptString = Renderer.indent(
			defaultValue
				? `\n ${chalk.bold.white(prompt)} ${chalk.gray(`(default: ${defaultValue})`)} `
				: `\n ${chalk.bold.white(prompt)} `,
		);

		return new Promise((resolve) => {
			rl.question(promptString, (answer) => {
				rl.close();

				if (process.stdin.isTTY) process.stdin.setRawMode(true);
				process.stdin.resume();
				readline.emitKeypressEvents(process.stdin);

				resolve(answer.trim() || defaultValue || "");
			});
		});
	}

	static async confirm(
		message: string,
		defaultYes: boolean = true,
	): Promise<boolean> {
		const suffix = defaultYes ? "(Y/n)" : "(y/N)";

		console.log(
			Renderer.indent(
				`\n ${chalk.yellow("!?")} ${chalk.bold.white(message)} ${chalk.gray(suffix)} `,
			),
		);

		return new Promise((resolve) => {
			const onKey = (_: string, key: any) => {
				process.stdin.removeListener("keypress", onKey);

				if (key.name === "y") {
					resolve(true);
					return;
				}
				if (key.name === "n" || key.name === "escape") {
					resolve(false);
					return;
				}

				if (key.name === "return" || key.name === "enter") {
					resolve(defaultYes);
					return;
				}

				resolve(false);
			};
			process.stdin.on("keypress", onKey);
		});
	}
}
