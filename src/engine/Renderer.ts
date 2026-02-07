import { Frame } from "./Frame.js";
import { Terminal } from "./Terminal.js";

export class Renderer {
  private prevLines: string[] = [];
  private width: number;
  private height: number;

  constructor() {
    this.width = process.stdout.columns || 80;
    this.height = process.stdout.rows || 24;
  }

  getSize(): { width: number; height: number } {
    this.width = process.stdout.columns || this.width || 80;
    this.height = process.stdout.rows || this.height || 24;
    return { width: this.width, height: this.height };
  }

  start(): void {
    process.stdout.write(Terminal.hideCursor());
    process.stdout.write(Terminal.clearScreen());
  }

  stop(): void {
    process.stdout.write(Terminal.showCursor());
    process.stdout.write(Terminal.clearScreen());
  }

  render(frame: Frame): void {
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
