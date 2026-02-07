import chalk from "chalk";
import type { InputAction } from "../engine/types.js";

export class TextInputModel {
  value = "";

  constructor(private placeholder = "") {}

  handleInput(action: InputAction): void {
    if (action.type === "char") this.value += action.char;
    if (action.type === "backspace") this.value = this.value.slice(0, -1);
  }

  render(width: number): string {
    const content = this.value.length ? this.value : chalk.gray(this.placeholder);
    return content.padEnd(width, " ");
  }
}
