import { Terminal } from "./Terminal.js";
export class Renderer {
    prevLines = [];
    width;
    height;
    constructor() {
        this.width = process.stdout.columns || 80;
        this.height = process.stdout.rows || 24;
    }
    getSize() {
        this.width = process.stdout.columns || this.width || 80;
        this.height = process.stdout.rows || this.height || 24;
        return { width: this.width, height: this.height };
    }
    start() {
        process.stdout.write(Terminal.hideCursor());
        process.stdout.write(Terminal.clearScreen());
    }
    stop() {
        process.stdout.write(Terminal.showCursor());
        process.stdout.write(Terminal.clearScreen());
    }
    render(frame) {
        const lines = frame.toLines();
        if (this.prevLines.length !== lines.length) {
            process.stdout.write(Terminal.clearScreen());
            this.prevLines = new Array(lines.length).fill("");
        }
        for (let i = 0; i < lines.length; i++) {
            const next = lines[i];
            if (this.prevLines[i] !== next) {
                process.stdout.write(Terminal.moveTo(0, i));
                process.stdout.write(next);
                this.prevLines[i] = next;
            }
        }
    }
}
