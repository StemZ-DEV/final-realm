import chalk from "chalk";
import { select, Separator } from "@inquirer/prompts";
import { GameState } from "./core/state";
import { startCombat } from "./features/combat";
import { openInventory } from "./features/inventory";
import { showMainMenu } from "./features/main-menu";
import { RPGTheme } from "./ui/theme";

async function main() {
	await showMainMenu();

	let player = GameState.getPlayer();

	const menuLog: string[] = [];

	const renderMenu = () => {
		console.clear();

		console.log(chalk.blue.bold("\n\n=== 🏰 FINAL REALM 🏰 ==="));

		const hpColor =
			player.stats.hp < player.stats.maxHp / 2 ? chalk.red : chalk.green;
		console.log(chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));
		console.log(`👤 ${chalk.bold(player.name)} (𝐋𝑉 ${player.level})`);
		console.log(
			`❤️   HP: ${hpColor(player.stats.hp + "/" + player.stats.maxHp)}`,
		);
		console.log(`✨  XP: ${player.xp}/${player.maxXp}`);
		console.log(`💰  Gold: ${chalk.yellow(player.gold)}`);
		console.log(chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));

		if (menuLog.length > 0) {
			console.log(chalk.dim("\nRecent Activity:"));
			menuLog.slice(-3).forEach((msg) => console.log(msg));
			console.log("");
		} else {
			console.log("\n");
		}
	};

	while (true) {
		renderMenu();

		const choice = await select({
			message: "What is your next move?",
			choices: [
				{
					name: "🔎 Explore the Wilds",
					value: "explore",
					description: "Find monsters to fight",
				},
				{
					name: "🔥 Rest at Campfire",
					value: "rest",
					description: "Restore your HP (Free)",
				},
				{
					name: "🎒 Check Inventory",
					value: "inventory",
					description: "View your items",
				},
				new Separator(),
				{
					name: "💾 Save Game",
					value: "save",
					description: "Save your progress to disk",
				},
				{
					name: "🚫 Quit",
					value: "quit",
				},
			],
			theme: {
				prefix: "❓",
				icon: RPGTheme.icon,
			},
		});

		switch (choice) {
			case "explore":
				const survived = await startCombat(player);
				if (!survived) {
					process.exit(0);
				}
				menuLog.push(chalk.cyan(`⚔️  Returned from exploration.`));
				break;

			case "rest":
				if (player.stats.hp < player.stats.maxHp) {
					const healAmount = player.stats.maxHp - player.stats.hp;
					player.stats.hp = player.stats.maxHp;
					menuLog.push(
						chalk.green(`💤 You rested and recovered ${healAmount} HP.`),
					);
				} else {
					menuLog.push(
						chalk.gray(`💤 You rest, but you are already fully healed.`),
					);
				}
				break;

			case "inventory":
				await openInventory(player);
				break;

			case "save":
				GameState.savePlayer(player);
				menuLog.push(chalk.blueBright(`💾 Game saved successfully.`));
				break;

			case "quit":
				console.clear();
				console.log(chalk.blue("Farewell, traveler..."));
				process.exit(0);
		}
	}
}

main();
