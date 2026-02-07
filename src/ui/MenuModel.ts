import chalk from "chalk";

export interface MenuOption<T> {
  label: string;
  value: T;
  description?: string;
}

export class MenuModel<T> {
  private index = 0;

  constructor(public options: MenuOption<T>[]) {}

  moveUp(): void {
    this.index = (this.index - 1 + this.options.length) % this.options.length;
  }

  moveDown(): void {
    this.index = (this.index + 1) % this.options.length;
  }

  getSelected(): MenuOption<T> {
    return this.options[this.index];
  }

  setOptions(options: MenuOption<T>[]): void {
    this.options = options;
    this.index = 0;
  }

  getLines(): string[] {
    return this.options.map((opt, i) => {
      if (i === this.index) return `${chalk.cyanBright(">")} ${chalk.white.bold(opt.label)}`;
      return `  ${chalk.gray(opt.label)}`;
    });
  }
}
