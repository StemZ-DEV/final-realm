import readline from "readline";
export class Input {
    keybinds;
    listener = null;
    constructor(keybinds) {
        this.keybinds = keybinds;
    }
    setKeybinds(keybinds) {
        this.keybinds = keybinds;
    }
    start(onAction, onExit) {
        if (process.stdin.isTTY)
            process.stdin.setRawMode(true);
        readline.emitKeypressEvents(process.stdin);
        process.stdin.resume();
        this.listener = (str, key) => {
            if (key?.ctrl && key.name === "c") {
                onExit();
                return;
            }
            const raw = normalizeKey(str, key);
            if (!raw)
                return;
            if (raw === "backspace") {
                onAction({ type: "backspace", raw });
                return;
            }
            const mapped = mapToAction(raw, this.keybinds);
            if (mapped) {
                onAction({ type: mapped, raw });
                return;
            }
            if (str && str.length === 1 && !key?.meta && !key?.ctrl) {
                onAction({ type: "char", char: str, raw });
            }
        };
        process.stdin.on("keypress", this.listener);
    }
    stop() {
        if (this.listener)
            process.stdin.removeListener("keypress", this.listener);
        if (process.stdin.isTTY)
            process.stdin.setRawMode(false);
        process.stdin.pause();
    }
}
function normalizeKey(str, key) {
    if (key?.name) {
        const name = key.name === "return" ? "enter" : key.name;
        return name.toLowerCase();
    }
    if (str)
        return str.toLowerCase();
    return null;
}
function mapToAction(raw, keybinds) {
    const entries = Object.entries(keybinds);
    for (const [action, keys] of entries) {
        if (keys.map((k) => k.toLowerCase()).includes(raw))
            return action;
    }
    return null;
}
