import { input, select } from "@inquirer/prompts";
import { Scene } from "../interfaces/Scene";
import { State } from "../core/StateManager";
import { Engine } from "../core/Engine";
import chalk from "chalk";
import { TownScene } from "./TownScene";
import { Menu, MenuOption } from "../ui/Menu";
import { Renderer } from "../ui/Renderer";
import { Input } from "../core/Input";
import { AudioManager } from "../core/Audio";

export class SaveSelectScene implements Scene {
	private menu: Menu<number> | null = null;

	constructor(private mode: "new" | "load" | "delete") {}

	enter() {
		Renderer.setTitle("Final Realm - Save Management");
		const slots = State.getSaveSlots();

		const options: MenuOption<number>[] = slots.map((s) => ({
			label: `Slot ${s.slot}: ${s.name} ${s.isEmpty ? "" : `(LVL ${s.level})`}`,
			value: s.slot,
			disabled:
				(this.mode === "load" && s.isEmpty) ||
				(this.mode === "delete" && s.isEmpty),
		}));

		options.push({ label: "Back", value: -1 });

		this.menu = new Menu(options);
	}

	render() {
		if (!this.menu) return;
		console.log(
			Renderer.renderHeader(
				`Final-Realm v${Engine.getVersion()}`,
				"Save Management" +
					(this.mode === "new"
						? ": New Save"
						: this.mode === "load"
							? ": Load Save"
							: this.mode === "delete"
								? `: ${chalk.red.bold("Delete Save")}`
								: ""),
			),
		);

		const content = this.menu.getContent();
		console.log(
			Renderer.createSinglePanel(
				content,
				this.mode === "new"
					? "Overwrite Save"
					: this.mode === "load"
						? "Load Game"
						: "Delete Save",
			),
		);
		console.log(
			Renderer.indent(chalk.gray("\n [↑/↓] Select   [ENTER] Confirm")),
		);
	}

	async update() {
		if (!this.menu) return;

		const signal = await Input.getNavigation();

		if (signal === "up") this.menu.moveUp();
		if (signal === "down") this.menu.moveDown();

		if (signal === "confirm") {
			const slot = this.menu.getSelectedValue();
			if (slot === -1) {
				Engine.getSceneManager().pop();
				return;
			}

			await this.handleSlotSelection(slot);
		}
	}

	private async handleSlotSelection(slot: number) {
		if (this.mode === "load") {
			const success = State.load(slot);
			if (success) {
				console.log(chalk.green("\n Save Loaded!"));
				await new Promise((r) => setTimeout(r, 500));
				Engine.getSceneManager().switch(new TownScene());
			}
		} else if (this.mode === "new") {
			const slots = State.getSaveSlots();
			const targetSlot = slots.find((s) => s.slot === slot);

			if (targetSlot && !targetSlot.isEmpty) {
				const proceed = await Input.confirm(
					`Slot ${slot} contains ${targetSlot.name}. Overwrite?`,
					false,
				);
				if (!proceed) return;
			}

			const name = await Input.readText(
				"Enter Character Name:",
				"Traveler",
			);
			State.createNewGame(name, slot);

			AudioManager.playSave();
			console.log(
				Renderer.indent(
					chalk.green(`\n Created ${name} in slot ${slot}!`),
				),
			);
			await new Promise((r) => setTimeout(r, 800));

			Engine.getSceneManager().switch(new TownScene());
		} else if (this.mode === "delete") {
			const slots = State.getSaveSlots();
			const target = slots.find((s) => s.slot === slot);

			if (!target || target.isEmpty) return;

			const confirm = await Input.confirm(
				`Are you sure you want to ${chalk.bold.underline("PERMANENTLY")} delete ${chalk.red.bold(target.name)}?`,
				false,
			);

			if (confirm) {
				State.deleteSave(slot);

				console.log(
					Renderer.indent(chalk.red("\n Save deleted successfully.")),
				);
				await new Promise((r) => setTimeout(r, 800));

				this.enter();
			}
		}
	}

	exit() {}
}
