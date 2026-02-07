export const Terminal = {
    clearScreen() {
        return "\x1b[2J\x1b[H";
    },
    hideCursor() {
        return "\x1b[?25l";
    },
    showCursor() {
        return "\x1b[?25h";
    },
    moveTo(x, y) {
        const col = Math.max(1, x + 1);
        const row = Math.max(1, y + 1);
        return `\x1b[${row};${col}H`;
    },
    clearLine() {
        return "\x1b[2K";
    },
};
