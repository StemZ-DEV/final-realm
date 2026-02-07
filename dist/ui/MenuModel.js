import chalk from "chalk";
export class MenuModel {
    options;
    index = 0;
    constructor(options) {
        this.options = options;
    }
    moveUp() {
        this.index = (this.index - 1 + this.options.length) % this.options.length;
    }
    moveDown() {
        this.index = (this.index + 1) % this.options.length;
    }
    getSelected() {
        return this.options[this.index];
    }
    setOptions(options) {
        this.options = options;
        this.index = 0;
    }
    getLines() {
        return this.options.map((opt, i) => {
            if (i === this.index)
                return `${chalk.cyanBright(">")} ${chalk.white.bold(opt.label)}`;
            return `  ${chalk.gray(opt.label)}`;
        });
    }
}
