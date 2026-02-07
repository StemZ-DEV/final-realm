import readline from "readline";
import type { InputAction, Keybinds, ActionKey } from "./types.js";

export class Input {
  private keybinds: Keybinds;
  private listener: ((str: string, key: readline.Key) => void) | null = null;

  constructor(keybinds: Keybinds) {
    this.keybinds = keybinds;
  }

  setKeybinds(keybinds: Keybinds): void {
    this.keybinds = keybinds;
  }

  start(onAction: (action: InputAction) => void, onExit: () => void): void {
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    readline.emitKeypressEvents(process.stdin);
    process.stdin.resume();

    this.listener = (str, key) => {
      if (key?.ctrl && key.name === "c") {
        onExit();
        return;
      }

      const raw = normalizeKey(str, key);
      if (!raw) return;

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

  stop(): void {
    if (this.listener) process.stdin.removeListener("keypress", this.listener);
    if (process.stdin.isTTY) process.stdin.setRawMode(false);
    process.stdin.pause();
  }
}

function normalizeKey(str: string, key: readline.Key | undefined): string | null {
  if (key?.name) {
    const name = key.name === "return" ? "enter" : key.name;
    return name.toLowerCase();
  }
  if (str) return str.toLowerCase();
  return null;
}

function mapToAction(raw: string, keybinds: Keybinds): ActionKey | null {
  const entries = Object.entries(keybinds) as [ActionKey, string[]][];
  for (const [action, keys] of entries) {
    if (keys.map((k) => k.toLowerCase()).includes(raw)) return action;
  }
  return null;
}
