import chalk from "chalk";
import { select, input, confirm, Separator } from "@inquirer/prompts";
import { GameState } from "../core/state";
import { showTitle } from "../ui/screen";
import { RPGTheme } from "../ui/theme";

export async function showMainMenu(): Promise<void> {
	while (true) {
		showTitle();

		const choice = await select({
			message: "Main Menu",
			choices: [
				new Separator(" "),
				{
					name: "Start New Game",
					value: "new",
					description: "Begin a new adventure",
				},
				{
					name: "Load Game",
					value: "load",
					description: "Continue from your last save",
				},
				{
					name: "Delete Save",
					value: "delete",
					description: "Delete an existing save file",
				},
				new Separator(),
				{ name: "Exit", value: "exit", description: "Exit the game" },
			],
			theme: {
				prefix: "☰",
				icon: RPGTheme.icon,
			},
		});

		switch (choice) {
			case "exit":
				console.log(
					chalk.blueBright("\nThanks for playing! Safe travels, adventurer!"),
				);
				process.exit(0);

			/**
			 *  NEW SAVE LOGIC
			 */
			case "new":
				const newSlot = await pickSlot("Select a save slot for your new game:");

				if (newSlot === -1) continue;

				if (GameState.saveExists(newSlot)) {
					const overwrite = await confirm({
						message: `Save slot ${newSlot} already exists. Do you want to overwrite it?`,
						default: false,
					});
					if (!overwrite) continue;
				}

				const name = await input({
					message: "What is your name, traveler?",
					default: "Hero",
				});
				GameState.createNewGame(newSlot, name);
				return;

			/**
			 *  LOAD SAVE LOGIC
			 */

			case "load":
				const validSlots = [1, 2, 3, 4, 5].filter((s) =>
					GameState.saveExists(s),
				);

				if (validSlots.length === 0) {
					console.log(
						chalk.yellow("\nNo save files found. Please start a new game."),
					);
					await pause();
					continue;
				}

				const loadChoices = validSlots.map((s) => ({
					name: `Slot ${s}: ${GameState.getPreview(s)}`,
					value: s,
				}));

				const loadSlot = await select({
					message: "Select a save slot to load:",
					choices: [
						new Separator(" "),
						...loadChoices,
						new Separator(),
						{ name: "Back", value: -1 },
					],
					theme: {
						prefix: "📂",
						icon: RPGTheme.icon,
					},
				});

				if (loadSlot === -1) continue;

				GameState.selectSlot(loadSlot);
				return;

			/**
			 *  DELETE SAVE LOGIC
			 */

			case "delete":
				const validSlotsToDelete = [1, 2, 3, 4, 5].filter((s) =>
					GameState.saveExists(s),
				);
				if (validSlotsToDelete.length === 0) {
					console.log(chalk.yellow("\nNo save files found to delete."));
					await pause();
					continue;
				}

				const deleteChoices = validSlotsToDelete.map((s) => ({
					name: `Slot ${s}: ${GameState.getPreview(s)}`,
					value: s,
				}));

				const deleteSlot = await select({
					message: "DELETE which save? (This action cannot be undone!)",
					choices: [
						new Separator(" "),
						...deleteChoices,
						new Separator(),
						{ name: "Back", value: -1 },
					],
					theme: {
						prefix: "❌",
						icon: RPGTheme.icon,
					},
				});

				if (deleteSlot === -1) continue;

				const sure = await confirm({
					message: `Are you sure you want to delete save slot ${deleteSlot}?`,
					default: false,
				});

				if (sure) {
					GameState.deleteSave(deleteSlot);
					console.log(
						chalk.greenBright(`\nSave slot ${deleteSlot} has been deleted.`),
					);
					await pause();
				}
		}
	}
}

async function pickSlot(message: string): Promise<number> {
	const choices = [1, 2, 3, 4, 5].map((s) => ({
		name: `Slot ${s}: ${GameState.getPreview(s)}`,
		value: s,
	}));

	return await select({
		message,
		choices: [
			new Separator(" "),
			...choices,
			new Separator(),
			{ name: "Back", value: -1 },
		],
		pageSize: 8,
		theme: {
			prefix: "💾",
			icon: RPGTheme.icon,
		},
	});
}

async function pause() {
	await select({
		message: "...",
		choices: [{ name: "Back", value: "ok" }],
	});
}
