import chalk from "chalk";
import { Scene } from "../interfaces/Scene";
import { Engine } from "../core/Engine";
import { Renderer } from "../ui/Renderer";
import { SaveSelectScene } from "./SaveSelectScene";
import { Menu } from "../ui/Menu";
import { Input } from "../core/Input";
import { SettingsScene } from "./SettingsScene";

export class MainMenuScene implements Scene {
	enter(): void {}

	private menu = new Menu([
		{ label: "New Game", value: "new" },
		{ label: "Continue", value: "load" },
		{ label: `[${chalk.red.bold("!")}] Delete Save`, value: "delete" },
		{ label: "Settings", value: "settings" },
		{ label: "Exit", value: "exit" },
	]);

	render(): void {
		console.log(
			Renderer.renderHeader(
				`Final-Realm v${Engine.getVersion()}`,
				"Select an option to begin your journey!",
			),
		);

		const actionContent = this.menu.getContent();
		console.log(Renderer.indent(actionContent));
		console.log(
			Renderer.indent(chalk.gray("\n [↑/↓] Select   [ENTER] Confirm")),
		);
	}

	async update(): Promise<void> {
		const signal = await Input.getNavigation();

		if (signal === "up") this.menu.moveUp();
		if (signal === "down") this.menu.moveDown();
		if (signal === "confirm") {
			const action = this.menu.getSelectedValue();
			return await this.handleAction(action);
		}
	}

	private async handleAction(action: string) {
		switch (action) {
			case "exit":
				console.log("Thank you for playing, Final-Realm!");
				await new Promise((r) => setTimeout(r, 800));
				Engine.stop();
				break;

			case "new":
				Engine.getSceneManager().push(new SaveSelectScene("new"));
				break;

			case "load":
				Engine.getSceneManager().push(new SaveSelectScene("load"));
				break;

			case "settings":
				Engine.getSceneManager().push(new SettingsScene());
				break;

			case "delete":
				Engine.getSceneManager().push(new SaveSelectScene("delete"));
				break;

			default:
				break;
		}
	}

	exit(): void {
		/** Cleanup shit here */
	}
}
