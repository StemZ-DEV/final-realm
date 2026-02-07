import type { Scene } from "../engine/Scene.js";
import type { Frame } from "../engine/Frame.js";
import type { InputAction } from "../engine/types.js";
import type { GameContext } from "../game/context.js";
import { MenuModel } from "../ui/MenuModel.js";
import { renderBox } from "../ui/layout.js";
import { VendorScene } from "./VendorScene.js";
import { QuestBoardScene } from "./QuestBoardScene.js";

export class TownScene implements Scene<GameContext> {
  private menu = new MenuModel([
    { label: "Blacksmith", value: "core:blacksmith" },
    { label: "Tailor", value: "core:tailor" },
    { label: "Pharmacy", value: "core:pharmacy" },
    { label: "General Store", value: "core:general" },
    { label: "Quest Board", value: "quests" },
    { label: "Back", value: "back" },
  ]);

  enter(): void {}
  exit(): void {}

  handleInput(ctx: GameContext, action: InputAction): void {
    if (action.type === "up") this.menu.moveUp();
    if (action.type === "down") this.menu.moveDown();
    if (action.type === "cancel") ctx.scenes.pop(ctx);
    if (action.type === "confirm") {
      const choice = this.menu.getSelected().value;
      if (choice === "back") return ctx.scenes.pop(ctx);
      if (choice === "quests") return ctx.scenes.push(new QuestBoardScene(), ctx);
      ctx.scenes.push(new VendorScene(choice), ctx);
    }
  }

  render(ctx: GameContext, frame: Frame): void {
    const save = ctx.game.currentSave;
    if (!save) return;
    const gold = save.player.gold;
    const lines = [`Gold: ${gold}`, "", ...this.menu.getLines()];
    const box = renderBox(lines.join("\n"), Math.min(60, frame.width - 4), "Town");
    frame.blit(2, 2, box);
  }
}
