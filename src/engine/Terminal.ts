export const Terminal = {
  clearScreen(): string {
    return "\x1b[2J\x1b[H";
  },
  hideCursor(): string {
    return "\x1b[?25l";
  },
  showCursor(): string {
    return "\x1b[?25h";
  },
  moveTo(x: number, y: number): string {
    const col = Math.max(1, x + 1);
    const row = Math.max(1, y + 1);
    return `\x1b[${row};${col}H`;
  },
  clearLine(): string {
    return "\x1b[2K";
  },
};
