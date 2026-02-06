import chalk from "chalk";
import { AudioManager } from "../core/Audio";

export interface MenuOption<T> {
	label: string;
	value: T;
	description?: string;
	disabled?: boolean;
}

export class Menu<T> {
	private selectedIndex: number = 0;

	constructor(private options: MenuOption<T>[]) {
		this.ensureValidSelection();
	}

	private ensureValidSelection(): void {
		const start = this.selectedIndex;
		while (this.options[this.selectedIndex].disabled) {
			this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
			if (this.selectedIndex === start) break;
		}
	}

	public moveUp(): void {
		const start = this.selectedIndex;
		do {
			this.selectedIndex =
				(this.selectedIndex - 1 + this.options.length) %
				this.options.length;
			AudioManager.playNav();
		} while (
			this.options[this.selectedIndex].disabled &&
			this.selectedIndex !== start
		);
	}

	public moveDown(): void {
		const start = this.selectedIndex;
		do {
			this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
			AudioManager.playNav();
		} while (
			this.options[this.selectedIndex].disabled &&
			this.selectedIndex !== start
		);
	}

	public getSelectedValue(): T {
		return this.options[this.selectedIndex].value;
	}

	public getContent(): string {
		return this.options
			.map((opt, i) => {
				if (opt.disabled) {
					return ` ${chalk.gray.dim(opt.label)} ${chalk.gray("(Empty)")}`;
				}

				if (i === this.selectedIndex) {
					return `${chalk.cyanBright(">")} ${chalk.white.bold(opt.label)}`;
				}

				return ` ${chalk.white.dim(opt.label)}`;
			})
			.join("\n");
	}
}
