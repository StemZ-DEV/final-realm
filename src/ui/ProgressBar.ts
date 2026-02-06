import chalk from "chalk";

interface ProgressBarOptions {
    width?: number;
    color?: "red" | "green" | "blue" | "yellow" | "cyan" | "magenta" | "white";
    emptyChar?: string;
    max?: number;
}

export class ProgressBar {
    private static readonly BLOCKS = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];

    static render(current: number, options: ProgressBarOptions = {}): string {
        const width = options.width || 10;
        const max = options.max || 100;
        const color = options.color || "white";
        const colorFunc = chalk[color];

        const totalEights = Math.round((Math.max(0, current) / max) * (width * 8));

        const fullBlocksCount = Math.floor(totalEights / 8);
        const remainderIndex = totalEights % 8;

        let barString = "";

        barString += "█".repeat(Math.min(fullBlocksCount, width));

        if (fullBlocksCount < width)
            barString += this.BLOCKS[remainderIndex];

        const currentLength = fullBlocksCount + (fullBlocksCount < width ? 1 : 0);
        const emptySpoace = width - currentLength;

        if (emptySpoace > 0)
            barString += " ".repeat(emptySpoace);

        return `[${colorFunc(barString)}]`;
    }
}