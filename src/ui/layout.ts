import boxen, { Options } from "boxen";
import chalk from "chalk";
import stringWidth from "string-width";
import stripAnsi from "strip-ansi";

const DEFAULT_BOX: Options = {
  padding: 1,
  borderStyle: "round",
  borderColor: "whiteBright",
};

export function renderHeader(title: string, subtitle: string | undefined, width: number): string {
  const text = subtitle
    ? `${chalk.bold.white(title)}\n${chalk.gray(subtitle)}`
    : chalk.bold.white(title);
  return boxen(text, { ...DEFAULT_BOX, textAlignment: "center", width });
}

export function renderBox(content: string, width?: number, title?: string): string {
  return boxen(content, { ...DEFAULT_BOX, title, width });
}

export function combineHorizontal(left: string, right: string, gap = 2): string {
  const leftLines = left.split("\n");
  const rightLines = right.split("\n");
  const height = Math.max(leftLines.length, rightLines.length);
  const leftWidth = Math.max(...leftLines.map((line) => stringWidth(stripAnsi(line))));

  const lines: string[] = [];
  for (let i = 0; i < height; i++) {
    const l = leftLines[i] ?? "";
    const r = rightLines[i] ?? "";
    const paddedLeft = l + " ".repeat(Math.max(0, leftWidth - stringWidth(stripAnsi(l))));
    lines.push(`${paddedLeft}${" ".repeat(gap)}${r}`);
  }
  return lines.join("\n");
}

export function centerPosition(frameWidth: number, frameHeight: number, box: string): { x: number; y: number } {
  const lines = box.split("\n");
  const boxWidth = Math.max(...lines.map((line) => stringWidth(stripAnsi(line))));
  const boxHeight = lines.length;
  const x = Math.max(0, Math.floor((frameWidth - boxWidth) / 2));
  const y = Math.max(0, Math.floor((frameHeight - boxHeight) / 2));
  return { x, y };
}

export function padLine(line: string, width: number): string {
  const w = stringWidth(stripAnsi(line));
  return line + " ".repeat(Math.max(0, width - w));
}

export function joinLines(lines: string[], width: number): string[] {
  return lines.map((line) => padLine(line, width));
}
