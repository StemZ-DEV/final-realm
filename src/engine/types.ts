export type ActionKey = "up" | "down" | "left" | "right" | "confirm" | "cancel";

export type InputAction =
  | { type: ActionKey; raw: string }
  | { type: "char"; char: string; raw: string }
  | { type: "backspace"; raw: string }
  | { type: "resize"; raw: string };

export type Keybinds = Record<ActionKey, string[]>;
