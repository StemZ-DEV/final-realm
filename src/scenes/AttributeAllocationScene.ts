import { confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { Scene } from "../interfaces/Scene";
import { State } from "../core/StateManager";
import { Engine } from "../core/Engine";
import { Renderer } from "../ui/Renderer";
import { Input } from "../core/Input";
import { ProgressBar } from "../ui/ProgressBar";
import { Attributes } from "../interfaces/Player";

const ATTR_CONFIG: { key: keyof Attributes; label: string; color: string }[] = [
	{ key: "strength", label: "Strength (STR)", color: "red" },
	{ key: "health", label: "Health    (HP)", color: "red" },
	{ key: "speed", label: "Speed    (SPD)", color: "green" },
	{ key: "evasion", label: "Evasion  (EVA)", color: "green" },
	{ key: "accuracy", label: "Accuracy (ACC)", color: "yellow" },
	{ key: "defense", label: "Defense  (DEF)", color: "yellow" },
	{ key: "intelligence", label: "Intell.  (INT)", color: "blue" },
	{ key: "wisdom", label: "Wisdom   (WIS)", color: "blue" },
];

export class AttributeAllocationScene implements Scene {
	private tempAttributes: Attributes;
	private tempPoints: number;

	private originalAttributes: Attributes;

	private selectedIndex = 0;

	constructor() {
		const p = State.getPlayer()!;

		this.tempAttributes = { ...p.attributes };
		this.originalAttributes = { ...p.attributes };
		this.tempPoints = p.attributePoints;
	}

	enter() {}

	render() {
		console.log(
			Renderer.renderHeader(
				chalk.bold("Attribute Allocation"),
				`Points Available: ${chalk.cyanBright.bold(this.tempPoints)}`,
			),
		);

		const rows = ATTR_CONFIG.map((conf, index) => {
			const isSelected = index === this.selectedIndex;
			const currentVal = this.tempAttributes[conf.key];

			const cursor = isSelected ? chalk.cyanBright(">") : " ";

			const label = isSelected
				? chalk.bold.white(conf.label)
				: chalk.gray(conf.label);

			const bar = ProgressBar.render(currentVal, {
				width: 15,
				color: conf.color as any,
				max: 30,
			});

			const valString = currentVal.toString().padStart(2);
			const valDisplay = isSelected
				? chalk.bold.white(valString)
				: chalk.gray(valString);

			return `${cursor} ${label}  ${bar}  ${valDisplay}`;
		});

		const confirmIndex = ATTR_CONFIG.length;
		const cancelIndex = ATTR_CONFIG.length + 1;

		const confirmBtn =
			this.selectedIndex === confirmIndex
				? chalk.greenBright("> [ Confirm & Save ]")
				: chalk.gray("  [ Confirm & Save ]");

		const cancelBtn =
			this.selectedIndex === cancelIndex
				? chalk.redBright("> [ Cancel ]")
				: chalk.gray("  [ Cancel ]");

		const content = rows.join("\n") + "\n\n" + confirmBtn + "\n" + cancelBtn;

		console.log(Renderer.createSinglePanel(content));
		console.log(
			Renderer.indent(
				chalk.gray("\n [↑/↓] Select   [←/→] Adjust   [ENTER] Confirm"),
			),
		);
	}

	async update() {
		const signal = await Input.getNavigation();
		const maxIndex = ATTR_CONFIG.length + 1;

		if (signal === "up") {
			this.selectedIndex =
				(this.selectedIndex - 1 + maxIndex + 1) % (maxIndex + 1);
		} else if (signal === "down") {
			this.selectedIndex = (this.selectedIndex + 1) % (maxIndex + 1);
		}

		if (this.selectedIndex >= ATTR_CONFIG.length) {
			if (signal === "confirm") {
				if (this.selectedIndex === ATTR_CONFIG.length) {
					this.saveAndExit();
				} else {
					Engine.getSceneManager().pop();
				}
			}
			return;
		}

		const attrKey = ATTR_CONFIG[this.selectedIndex].key;

		if (signal === "right") {
			if (this.tempPoints > 0) {
				this.tempAttributes[attrKey]++;
				this.tempPoints--;
			}
		} else if (signal === "left") {
			if (this.tempAttributes[attrKey] > this.originalAttributes[attrKey]) {
				this.tempAttributes[attrKey]--;
				this.tempPoints++;
			}
		}
	}

	private saveAndExit() {
		const p = State.getPlayer()!;
		p.attributes = { ...this.tempAttributes };
		p.attributePoints = this.tempPoints;

		State.save();

		console.log(Renderer.indent(chalk.green("\n Attributes Updated!")));
		Engine.getSceneManager().pop();
	}

	exit() {}
}
