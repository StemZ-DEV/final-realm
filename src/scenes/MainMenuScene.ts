import chalk from "chalk";
import { Scene } from "../interfaces/Scene";
import { Engine } from "../core/Engine";
import { Renderer } from "../ui/Renderer";
import { SaveSelectScene } from "./SaveSelectScene";
import { Menu } from "../ui/Menu";
import { Input } from "../core/Input";

export class MainMenuScene implements Scene {
	enter(): void {}

	private menu = new Menu([
		{ label: "New Game", value: "new" },
		{ label: "Continue", value: "load" },
		{ label: "Exit", value: "exit" },
	]);

	render(): void {
		console.log(Renderer.renderHeader("Final-Realm", "by StemZ-DEV"));
		console.log(
			chalk.whiteBright.underline("Choose an option to begin your journey!"),
		);

		const actionContent = this.menu.getContent();
		console.log(actionContent);
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
                await new Promise(r => setTimeout(r, 800));
				Engine.stop();
				break;

			case "new":
				Engine.getSceneManager().push(new SaveSelectScene("new"));
				break;

			case "load":
				Engine.getSceneManager().push(new SaveSelectScene("load"));
				break;

			default:
				break;
		}
	}

	exit(): void {
		/** Cleanup shit here */
	}
}
