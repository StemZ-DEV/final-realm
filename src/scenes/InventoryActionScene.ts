import type { Scene } from "../engine/Scene.js";
import type { Frame } from "../engine/Frame.js";
import type { InputAction } from "../engine/types.js";
import type { GameContext } from "../game/context.js";
import type { ItemInstance } from "../game/models.js";
import { MenuModel } from "../ui/MenuModel.js";
import { renderBox, centerPosition } from "../ui/layout.js";
import { equipItem, removeItem, unequipItem } from "../game/systems/inventory.js";
import { consumeItem } from "../game/systems/combat.js";

interface InventoryEntry {
  type: "equip" | "inv";
  label: string;
  slot?: "mainHand" | "offHand" | "armor" | "accessory";
  index?: number;
  instance: ItemInstance;
}

export class InventoryActionScene implements Scene<GameContext> {
  transparent = true;
  modal = true;
  private menu: MenuModel<string>;

  constructor(private entry: InventoryEntry, private onDone: () => void) {
    const options = buildOptions(entry);
    this.menu = new MenuModel(options.map((opt) => ({ label: opt, value: opt })));
  }

  enter(): void {}
  exit(): void {}

  handleInput(ctx: GameContext, action: InputAction): void {
    if (!ctx.game.currentSave) return;
    if (action.type === "up") this.menu.moveUp();
    if (action.type === "down") this.menu.moveDown();
    if (action.type === "cancel") ctx.scenes.pop(ctx);
    if (action.type === "confirm") {
      const choice = this.menu.getSelected().value;
      const player = ctx.game.currentSave.player;
      if (choice === "Equip" && this.entry.type === "inv" && this.entry.index !== undefined) {
        const err = equipItem(player, ctx.registry, this.entry.index);
        if (err) ctx.scenes.pop(ctx);
      }
      if (choice === "Unequip" && this.entry.type === "equip" && this.entry.slot) {
        unequipItem(player, this.entry.slot);
      }
      if (choice === "Drop" && this.entry.type === "inv") {
        removeItem(player, this.entry.instance.id, 1);
      }
      if (choice === "Use" && this.entry.type === "inv") {
        consumeItem(player, ctx.registry, this.entry.instance);
        if (this.entry.instance.qty <= 0 && this.entry.index !== undefined) {
          player.inventory.splice(this.entry.index, 1);
        }
      }
      this.onDone();
      ctx.scenes.pop(ctx);
    }
  }

  render(ctx: GameContext, frame: Frame): void {
    const content = this.menu.getLines().join("\n");
    const box = renderBox(content, 30, "Item Actions");
    const pos = centerPosition(frame.width, frame.height, box);
    frame.blit(pos.x, pos.y, box);
  }
}

function buildOptions(entry: InventoryEntry): string[] {
  const options: string[] = [];
  if (entry.type === "inv") {
    options.push("Equip");
    options.push("Use");
    options.push("Drop");
  }
  if (entry.type === "equip") options.push("Unequip");
  if (options.length === 0) options.push("Back");
  return options;
}
