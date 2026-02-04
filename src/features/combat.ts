import chalk from "chalk";
import { select, Separator } from "@inquirer/prompts";
import { Player } from "../entities/player";
import { Enemy, getRandomEnemy } from "../entities/enemy";
import { RPGTheme } from "../ui/theme";
import { getTotalStats } from "./stats";

export async function startCombat(player: Player): Promise<boolean> {
	const enemy = getRandomEnemy();

	const combatLog: string[] = [];

	const totalStats = getTotalStats(player);

	const renderScreen = () => {
		console.clear();

		console.log(chalk.redBright(`\n\n⚔️  A wild ${enemy.name} appears!`));
		console.log(chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));

		const pHealth = `${player.stats.hp}/${player.stats.maxHp} HP`.padEnd(15);
		const eHealth = `${enemy.hp}/${enemy.maxHp} HP`.padEnd(15);

		console.log(
			`${chalk.green(player.name)}: ${pHealth} | ${chalk.red(enemy.name)}: ${eHealth}`,
		);
		console.log(chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));

		if (combatLog.length > 0) {
			combatLog.slice(-2).forEach((line) => console.log(line));
			console.log("");
		}
	};

	while (player.stats.hp > 0 && enemy.hp > 0) {
		renderScreen();

		const action = await select({
			message: "Choose your action:",
			choices: [
				new Separator(" "),
				{ name: "Attack", value: "attack" },
				{ name: "Run", value: "run" },
			],
			theme: {
				prefix: "⚔️ ",
				icon: RPGTheme.icon,
			},
		});

		switch (action) {
			case "attack":
				const atkStats = getTotalStats(player);
				const dmg = atkStats.attack;
				enemy.hp -= dmg;
				combatLog.push(`You strike the ${enemy.name} for ${dmg} damage!`);
				break;

			case "run":
				combatLog.push("You attempt to flee...");
				if (Math.random() < 0.5) {
					combatLog.push("You successfully escaped!");
					return true;
				} else {
					combatLog.push("You failed to escape!");
				}
				break;
		}

		if (enemy.hp > 0) {
			const defStats = getTotalStats(player);
			const eDmg = Math.max(1, enemy.attack - defStats.defense);
			player.stats.hp -= eDmg;
			combatLog.push(`The ${enemy.name} hits you for ${eDmg} damage!`);
		}
	}

	renderScreen();

	if (player.stats.hp <= 0) {
		console.log(chalk.redBright.bold("\n💀 You have been defeated..."));
		return false;
	} else {
		console.log(chalk.greenBright.bold(`\n🎉 You defeated the ${enemy.name}!`));
		player.xp += enemy.xpReward;
		player.gold += enemy.goldReward;
		console.log(
			chalk.yellowBright(
				`You gained ${enemy.xpReward} XP and ${enemy.goldReward} Gold!`,
			),
		);

		await select({
			message: "Press Enter to continue...",
			choices: [{ name: "Continue", value: "ok" }],
		});

		return true;
	}
}
