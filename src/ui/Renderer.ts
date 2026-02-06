import boxen, { Options } from "boxen";
import chalk from "chalk";
import { State } from "../core/StateManager";

const BOX_STYLE: Options = {
	padding: 1,
	borderStyle: "round",
	borderColor: "whiteBright",
	dimBorder: true,
};

const GAME_WIDTH = 80;

export class Renderer {
	static setTitle(title: string) {
		process.stdout.write(`\x1B]2;${title}\x07`);
	}

	static getPadding(): string {
		if (!State.getSettings().centerContent) {
			return "";
		}

		const terminalWidth = process.stdout.columns || 80;
		const paddingAmount = Math.max(
			0,
			Math.floor((terminalWidth - GAME_WIDTH) / 2),
		);
		return " ".repeat(paddingAmount);
	}

	static indent(text: string): string {
		const pad = this.getPadding();
		return text
			.split("\n")
			.map((line) => pad + line)
			.join("\n");
	}

	/** Create a full-width header box */
	static renderHeader(title: string, subtitle?: string): string {
		const text = subtitle
			? `${chalk.bold.white(title)}\n${chalk.gray(subtitle)}`
			: chalk.bold.white(title);

		const box = boxen(text, {
			...BOX_STYLE,
			textAlignment: "center",
			width: GAME_WIDTH,
		});

		return this.indent(box);
	}

	/** Create a side by side layout (Player Stats | Menu) */
	static createDualPanel(leftContent: string, rightContent: string): string {
		const width = 38;

		const leftLines = leftContent.split("\n");
		const rightLines = rightContent.split("\n");

		const innerHeight = Math.max(leftLines.length, rightLines.length);

		const leftBox = boxen(leftContent, {
			...BOX_STYLE,
			width,
			height: innerHeight + 2,
			title: "Hero",
		});

		const rightBox = boxen(rightContent, {
			...BOX_STYLE,
			width,
			height: innerHeight + 2,
			borderColor: "greenBright",
			title: "Action",
		});

		const leftArr = leftBox.split("\n");
		const rightArr = rightBox.split("\n");

		const stitched = leftArr
			.map((line, i) => `${line}  ${rightArr[i] || ""}`)
			.join("\n");

		return this.indent(stitched);
	}

	static createSinglePanel(content: string, title?: string): string {
		const box = boxen(content, {
			...BOX_STYLE,
			width: 60,
			padding: 1,
			title: title,
			textAlignment: "left",
		});

		return this.indent(box);
	}
}
