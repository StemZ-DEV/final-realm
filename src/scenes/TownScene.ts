import chalk from "chalk";
import { Scene } from "../interfaces/Scene";
import { Renderer } from "../ui/Renderer";
import { State } from "../core/StateManager";
import { Engine } from "../core/Engine";
import { MainMenuScene } from "./MainMenuScene";
import { Menu } from "../ui/Menu";
import { Input } from "../core/Input";
import { SettingsScene } from "./SettingsScene";
import { AttributeAllocationScene } from "./AttributeAllocationScene";
import { AudioManager } from "../core/Audio";

export class TownScene implements Scene {
	enter(): void {
		Renderer.setTitle("Final Realm - Town");
	}

	private menu = new Menu([
		{ label: "🌳 Explore the Wilds", value: "explore" },
		{ label: "🎒 Manage Inventory", value: "inv" },
		{ label: "✨ Assign Attributes", value: "stats" },
		{ label: "🔧 Settings", value: "settings" },
		{ label: "💾 Save & Exit", value: "exit" },
	]);

	render(): void {
		const p = State.getPlayer();
		if (!p) {
			// render "no save" view"
			return;
		}

		const attr = p.attributes;

		// Stat Display
		const col1 =
			`STR: ${attr.strength.toString().padEnd(3)} HP: ${attr.health}\n` +
			`SPD: ${attr.speed.toString().padEnd(3)} EVA: ${attr.evasion}\n` +
			`ACC: ${attr.accuracy.toString().padEnd(3)} DEF: ${attr.defense}\n` +
			`INT: ${attr.intelligence.toString().padEnd(3)} WIS: ${attr.wisdom}`;

		const playerStats =
			`${chalk.bold.yellowBright(p.name)} (LVL ${chalk.bold.yellowBright(p.level)})\n` +
			`${chalk.gray("──────────────────────────────")}\n` +
			`${col1}\n` +
			`${chalk.gray("──────────────────────────────")}\n` +
			`HP: ${p.hp}/${p.maxHp} | MP: ${p.mp}/${p.maxMp}\n` +
			`Attribute Points: ${chalk.cyanBright(p.attributePoints)}`;

		const actionContent = this.menu.getContent();

		console.log(
			Renderer.renderHeader(
				`Final-Realm v${Engine.getVersion()}`,
				`Location: ${chalk.cyan.underline("Town")}`,
			),
		);
		console.log(Renderer.createDualPanel(playerStats, actionContent));
		console.log("");
		console.log(
			Renderer.indent(chalk.gray("\n [↑/↓] Select   [ENTER] Confirm")),
		);
	}

	async update() {
		const signal = await Input.getNavigation();

		if (signal === "up") this.menu.moveUp();
		if (signal === "down") this.menu.moveDown();
		if (signal === "confirm") {
			const action = this.menu.getSelectedValue();
			return await this.handleAction(action);
		}
	}

	private async handleAction(action: string) {
		AudioManager.playSelect();
		if (action === "exit") {
			const proceed = await Input.confirm("Save and exit to Main Menu?");
			if (proceed) {
				State.save();
				AudioManager.playSave();
				console.log(Renderer.indent(chalk.green(" Game Saved.")));
				await new Promise((r) => setTimeout(r, 600));
				Engine.getSceneManager().switch(new MainMenuScene());
			}
		}

		if (action === "settings") {
			Engine.getSceneManager().push(new SettingsScene());
		}

		if (action === "stats") {
			Engine.getSceneManager().push(new AttributeAllocationScene());
		}
	}

	exit() {}
}
