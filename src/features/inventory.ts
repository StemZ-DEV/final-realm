import chalk from "chalk";
import { select, Separator } from "@inquirer/prompts";
import { Player } from "../entities/player";
import { getItem } from "../data/items";
import { RarityMap, RPGTheme } from "../ui/theme";

export async function openInventory(player: Player): Promise<void> {
	let lastCursor: any = undefined;

	while (true) {
		console.clear();

		console.log(chalk.blue.bold("\n\n=== 🎒 INVENTORY 🎒 ==="));
		console.log(chalk.gray("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"));

		const hand = getItemName(player.equipment.mainHand);
		const armor = getItemName(player.equipment.armor);

		const handStats = getStatLabel(player.equipment.mainHand);
		const armorStats = getStatLabel(player.equipment.armor);

		console.log(
			chalk.gray(
				`Equipped:\n[ 🖐️  ${chalk.bold(hand)} ] ${handStats}\n[ 🛡️  ${chalk.bold(armor)} ] ${armorStats}`,
			),
		);
		console.log(chalk.gray("────────────────────────────────────────"));

		const choices: any[] = [];

		// EQUIPPED

		choices.push(new Separator("Equipped Gear"));

		choices.push({
			name: `🖐️  Main Hand: ${hand}`,
			value: "slot_mainHand",
			description: player.equipment.mainHand
				? "Select to unequip"
				: "Empty slot",
		});

		choices.push({
			name: `🛡️  Armor: ${armor}`,
			value: "slot_armor",
			description: player.equipment.armor ? "Select to unequip" : "Empty slot",
		});

		// BACKPACK
		choices.push(new Separator());
		choices.push(new Separator("Backpack"));

		if (player.inventory.length === 0) {
			choices.push({
				name: chalk.gray(" (Bag is empty)"),
				value: "ignore",
				disabled: true,
			});
		} else {
			player.inventory.forEach((itemId, index) => {
				const item = getItem(itemId);
				if (item) {
					choices.push({
						name: `${getItemName(itemId)}`,
						value: index,
						description: item.description,
					});
				}
			});
		}

		choices.push(new Separator());
		choices.push({ name: "Back", value: "back" });

		const selection = await select({
			message: "Manage Inventory:",
			choices: choices,
			loop: false,
			pageSize: 12,
			theme: {
				icon: RPGTheme.icon,
				prefix: "🎒",
			},
			default: lastCursor,
		});

		if (selection === "back") return;

		lastCursor = selection;

		if (selection === "slot_mainHand" || selection === "slot_armor") {
			const slot = selection === "slot_mainHand" ? "mainHand" : "armor";
			const currentItem = player.equipment[slot];

			if (!currentItem) {
				console.log(chalk.yellowBright("\nThat slot is already empty."));
				await pause();
				continue;
			}

			const action = await select({
				message: `Unequip ${getItem(currentItem)?.name}`,
				choices: [
					{ name: "Yes, unequip", value: "yes" },
					{ name: "Cancel", value: "no" },
				],
				theme: {
					icon: RPGTheme.icon,
					prefix: "🎒",
				},
			});

			if (action === "yes") {
				player.inventory.push(currentItem);
				player.equipment[slot] = undefined;
				console.log(
					chalk.greenBright(
						`${getItem(currentItem)?.name} returned to Backpack.`,
					),
				);
				await pause();
			}
			continue;
		}

		if (typeof selection === "number") {
			const index = selection;
			const item = getItem(player.inventory[index]);

			if (!item) continue;

			const actions = [];

			if (item.type === "consumable")
				actions.push({ name: "Use / Eat", value: "use" });

			if (item.type === "weapon" || item.type === "armor") {
				actions.push({ name: "Equip", value: "equip" });
			}

			actions.push({ name: "Drop", value: "drop" });
			actions.push({ name: "Cancel", value: "cancel" });

			const action = await select({
				message: `${item.name}: Action?`,
				choices: actions,
				theme: {
					icon: RPGTheme.icon,
					prefix:
						item.type === "consumable"
							? "🧪"
							: item.type === "armor"
								? "🛡️ "
								: item.type === "weapon"
									? "🗡️ "
									: "📦 ",
				},
			});

			if (action === "equip") {
				const slot = item.type === "weapon" ? "mainHand" : "armor";

				player.inventory.splice(index, 1);

				if (player.equipment[slot]) {
					player.inventory.push(player.equipment[slot]!);
					console.log(
						chalk.yellow(
							`Unequipped ${getItem(player.equipment[slot]!)?.name}...`,
						),
					);
				}

				player.equipment[slot] = item.id;
				console.log(chalk.green(`Equipped ${item.name}!`));

				if (index >= player.inventory.length) {
					lastCursor = Math.max(0, player.inventory.length - 1);
				}

				await pause();
			} else if (action === "use" && item.use) {
				const msg = item.use(player);
				console.log(chalk.green(msg));
				player.inventory.splice(index, 1);

				if (index >= player.inventory.length) {
					lastCursor = Math.max(0, player.inventory.length - 1);
				}

				if (player.inventory.length === 0) lastCursor = "slot_mainHand";

				await pause();
			} else if (action === "drop") {
				console.log(chalk.red(`Dropped ${item.name}`));
				player.inventory.splice(index, 1);

				if (index >= player.inventory.length) {
					lastCursor = Math.max(0, player.inventory.length - 1);
				}

				if (player.inventory.length === 0) lastCursor = "slot_mainHand";

				await pause();
			}
		}
	}
}

async function pause() {
	await select({
		message: "...",
		choices: [{ name: "Continue", value: "ok" }],
		theme: {
			icon: RPGTheme.icon,
		},
	});
}

function getItemName(itemId?: string): string {
	if (!itemId) return chalk.gray("Empty");

	const item = getItem(itemId);

	if (!item) return chalk.redBright("Error");

	const color = RarityMap[item.rarity] || chalk.whiteBright;
	return color(item.name);
}

function getStatLabel(itemId?: string): string {
	if (!itemId) return "";

	const item = getItem(itemId);
	if (!item || !item.stats) return "";

	const parts: string[] = [];

	const format = (val: number, label: string) => {
		if (val === 0) return null;

		const sign = val > 0 ? "+" : "";
		const text = `${sign}${val} ${label}`;

		return val > 0 ? chalk.greenBright(text) : chalk.redBright(text);
	};

	if (item.stats.attack) {
		const txt = format(item.stats.attack, "ATK");
		if (txt) parts.push(txt);
	}

	if (item.stats.defense) {
		const txt = format(item.stats.defense, "DP");
		if (txt) parts.push(txt);
	}

	if (item.stats.accuracy) {
		const txt = format(item.stats.accuracy, "ACC");
		if (txt) parts.push(txt);
	}

	if (parts.length > 0) return chalk.gray(`(${parts.join(", ")})`);

	return "";
}
