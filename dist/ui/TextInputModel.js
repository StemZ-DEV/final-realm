import chalk from "chalk";
export class TextInputModel {
    placeholder;
    value = "";
    constructor(placeholder = "") {
        this.placeholder = placeholder;
    }
    handleInput(action) {
        if (action.type === "char")
            this.value += action.char;
        if (action.type === "backspace")
            this.value = this.value.slice(0, -1);
    }
    render(width) {
        const content = this.value.length ? this.value : chalk.gray(this.placeholder);
        return content.padEnd(width, " ");
    }
}
