const ANSI_PATTERN = /^\x1b\[[0-9;]*m/;
export class Frame {
    width;
    height;
    cells;
    constructor(width, height) {
        this.width = Math.max(1, width);
        this.height = Math.max(1, height);
        this.cells = [];
        this.clear();
    }
    clear() {
        this.cells = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => ({ ch: " ", style: "" })));
    }
    clearLine(y) {
        if (y < 0 || y >= this.height)
            return;
        for (let x = 0; x < this.width; x++) {
            this.cells[y][x] = { ch: " ", style: "" };
        }
    }
    setLine(y, text) {
        this.clearLine(y);
        this.write(0, y, text);
    }
    write(x, y, text) {
        if (y < 0 || y >= this.height)
            return;
        if (x >= this.width)
            return;
        const cells = parseAnsiToCells(text);
        let cx = x;
        for (const cell of cells) {
            if (cx < 0) {
                cx++;
                continue;
            }
            if (cx >= this.width)
                break;
            this.cells[y][cx] = cell;
            cx++;
        }
    }
    blit(x, y, text) {
        const lines = text.replace(/\r/g, "").split("\n");
        for (let i = 0; i < lines.length; i++) {
            this.write(x, y + i, lines[i]);
        }
    }
    toLines() {
        const lines = [];
        for (let y = 0; y < this.height; y++) {
            let line = "";
            let currentStyle = "";
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x];
                if (cell.style !== currentStyle) {
                    if (currentStyle !== "")
                        line += "\x1b[0m";
                    if (cell.style !== "")
                        line += cell.style;
                    currentStyle = cell.style;
                }
                line += cell.ch;
            }
            if (currentStyle !== "")
                line += "\x1b[0m";
            lines.push(line);
        }
        return lines;
    }
}
function parseAnsiToCells(text) {
    const out = [];
    let i = 0;
    let style = "";
    while (i < text.length) {
        const ch = text[i];
        if (ch === "\x1b") {
            const match = text.slice(i).match(ANSI_PATTERN);
            if (match) {
                const seq = match[0];
                if (seq === "\x1b[0m")
                    style = "";
                else
                    style += seq;
                i += seq.length;
                continue;
            }
        }
        if (ch === "\t") {
            for (let t = 0; t < 4; t++)
                out.push({ ch: " ", style });
            i++;
            continue;
        }
        if (ch === "\r") {
            i++;
            continue;
        }
        out.push({ ch, style });
        i++;
    }
    return out;
}
