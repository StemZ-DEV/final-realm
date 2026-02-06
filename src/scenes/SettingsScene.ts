import { Scene } from "../interfaces/Scene";
import { State } from "../core/StateManager";
import { Engine } from "../core/Engine";
import { Renderer } from "../ui/Renderer";
import { Menu } from "../ui/Menu";
import { Input } from "../core/Input";
import chalk from "chalk";
import { AudioManager } from "../core/Audio";

export class SettingsScene implements Scene {
	private menu: Menu<string>;

	constructor() {
		this.menu = this.buildMenu();
	}

	private buildMenu(): Menu<string> {
		const settings = State.getSettings();

		return new Menu([
			{
				label: `Center Game Window [${settings.centerContent ? chalk.green("ON") : chalk.red("OFF")}]`,
				value: "toggle_center",
			},
			{ label: "Back to Main Menu", value: "back" },
		]);
	}

	enter() {
		Renderer.setTitle("Final Realm - Game Settings");
	}

	render() {
		console.log(
			Renderer.renderHeader("GAME SETTINGS", "Configure your experience"),
		);
		console.log(
			Renderer.createSinglePanel(this.menu.getContent(), "Options"),
		);
		console.log(
			Renderer.indent(
				chalk.gray("\n [↑/↓] Navigate   [ENTER] Toggle / Select"),
			),
		);
	}

	async update() {
		const signal = await Input.getNavigation();

		if (signal === "up") this.menu.moveUp();
		if (signal === "down") this.menu.moveDown();

		if (signal === "resize") return;

		if (signal === "confirm") {
			const action = this.menu.getSelectedValue();
			if (action === "back") {
				AudioManager.playSelect();
				Engine.getSceneManager().pop();
			} else if (action === "toggle_center") {
				AudioManager.playSelect2();
				const current = State.getSettings().centerContent;
				State.updateSetting("centerContent", !current);

				this.menu = this.buildMenu();
			}
		}
	}

	exit() {}
}
