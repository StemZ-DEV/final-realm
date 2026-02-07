import type { Scene } from "../engine/Scene.js";
import type { Frame } from "../engine/Frame.js";
import type { InputAction } from "../engine/types.js";
import type { GameContext } from "../game/context.js";
import type { ItemInstance } from "../game/models.js";
import { MenuModel } from "../ui/MenuModel.js";
import { renderBox, combineHorizontal } from "../ui/layout.js";
import { InventoryActionScene } from "./InventoryActionScene.js";
import { MessageScene } from "./MessageScene.js";

interface InventoryEntry {
  type: "equip" | "inv";
  label: string;
  slot?: "mainHand" | "offHand" | "armor" | "accessory";
  index?: number;
  instance: ItemInstance;
}

export class InventoryScene implements Scene<GameContext> {
  private menu = new MenuModel<InventoryEntry>([]);

  enter(ctx: GameContext): void {
    this.refresh(ctx);
  }

  exit(): void {}

  handleInput(ctx: GameContext, action: InputAction): void {
    if (action.type === "up") this.menu.moveUp();
    if (action.type === "down") this.menu.moveDown();
    if (action.type === "cancel") ctx.scenes.pop(ctx);
    if (action.type === "confirm") {
      const entry = this.menu.getSelected().value;
      ctx.scenes.push(
        new InventoryActionScene(entry, () => this.refresh(ctx)),
        ctx
      );
    }
  }

  render(ctx: GameContext, frame: Frame): void {
    const save = ctx.game.currentSave;
    if (!save) return;

    const listLines = this.menu.getLines().join("\n");
    const left = renderBox(listLines || "(Empty)", 36, "Inventory");

    const selected = this.menu.getSelected()?.value;
    const details = selected ? renderDetails(selected, ctx) : "No selection";
    const right = renderBox(details, 40, "Details");

    const top = combineHorizontal(left, right, 2);
    frame.blit(2, 1, top);

    const actions = "Enter: Actions  |  Esc: Back";
    const bottom = renderBox(actions, Math.min(frame.width - 4, 78), "Actions");
    frame.blit(2, frame.height - 6, bottom);
  }

  private refresh(ctx: GameContext): void {
    const save = ctx.game.currentSave;
    if (!save) return;

    const entries: InventoryEntry[] = [];
    const eq = save.player.equipment;
    const slots: Array<["mainHand" | "offHand" | "armor" | "accessory", string]> = [
      ["mainHand", "Main Hand"],
      ["offHand", "Off Hand"],
      ["armor", "Armor"],
      ["accessory", "Accessory"],
    ];

    for (const [slot, label] of slots) {
      const item = eq[slot];
      if (!item) continue;
      const def = ctx.registry.getItem(item.id);
      const dur = item.durability !== undefined ? ` (${item.durability})` : "";
      entries.push({
        type: "equip",
        slot,
        label: `[E] ${label}: ${def?.name ?? item.id}${dur}`,
        instance: item,
      });
    }

    save.player.inventory.forEach((item, index) => {
      const def = ctx.registry.getItem(item.id);
      const dur = item.durability !== undefined ? ` (${item.durability})` : "";
      const qty = item.qty > 1 ? ` x${item.qty}` : "";
      entries.push({
        type: "inv",
        index,
        label: `${def?.name ?? item.id}${qty}${dur}`,
        instance: item,
      });
    });

    if (entries.length === 0) {
      this.menu.setOptions([{ label: "(Empty)", value: { type: "inv", label: "(Empty)", instance: { id: "", qty: 0 } } as InventoryEntry }]);
      return;
    }

    this.menu.setOptions(entries.map((entry) => ({ label: entry.label, value: entry })));
  }
}

function renderDetails(entry: InventoryEntry, ctx: GameContext): string {
  const def = ctx.registry.getItem(entry.instance.id);
  if (!def) return "Unknown item";
  const lines: string[] = [];
  lines.push(def.name);
  lines.push(`Type: ${def.type}`);
  lines.push(`Rarity: ${def.rarity}`);
  if (def.stats) {
    lines.push("Stats:");
    for (const [key, value] of Object.entries(def.stats)) {
      lines.push(`  ${key}: ${value}`);
    }
  }
  if (entry.instance.enhancements && entry.instance.enhancements.length) {
    lines.push("Enhancements:");
    for (const enh of entry.instance.enhancements) {
      lines.push(`  +${enh.value} ${enh.stat}`);
    }
  }
  if (entry.instance.durability !== undefined) {
    lines.push(`Durability: ${entry.instance.durability}`);
  }
  if (def.description) lines.push(def.description);
  return lines.join("\n");
}
