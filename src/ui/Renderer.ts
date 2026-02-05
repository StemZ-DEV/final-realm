import boxen, { Options } from "boxen";
import chalk from "chalk";
import stripAnsi from "strip-ansi";

const BOX_STYLE: Options = {
	padding: 1,
	borderStyle: "round",
	borderColor: "whiteBright",
	dimBorder: true,
};

export class Renderer {
	/** Create a full-width header box */
	static renderHeader(title: string, subtitle?: string): string {
		const text = subtitle
			? `${chalk.bold.white(title)}\n${chalk.gray(subtitle)}`
			: chalk.bold.white(title);

		return boxen(text, {
			...BOX_STYLE,
			textAlignment: "center",
			width: 80,
		});
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
            title: "Hero"
        });

        const rightBox = boxen(rightContent, {
            ...BOX_STYLE,
            width,
            height: innerHeight + 2,
            borderColor: "greenBright",
            title: "Action"
        });

        const leftArr = leftBox.split("\n");
        const rightArr = rightBox.split("\n");

        return leftArr.map((line, i) => `${line}  ${rightArr[i] || ""}`).join("\n");
	}

    static createSinglePanel(content: string, title?: string): string {
        return boxen(content, {
            ...BOX_STYLE,
            width: 60,
            padding: 1,
            title: title,
            textAlignment: "left"
        });
    }
}
