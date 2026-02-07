import type { Scene } from "../engine/Scene.js";
import type { Frame } from "../engine/Frame.js";
import type { InputAction } from "../engine/types.js";
import type { GameContext } from "../game/context.js";
import { MenuModel } from "../ui/MenuModel.js";
import { renderHeader, centerPosition } from "../ui/layout.js";
import { SaveSlotActionScene } from "./SaveSlotActionScene.js";

export class SaveSelectScene implements Scene<GameContext> {
  private menu = new MenuModel<{ slot: number; isEmpty: boolean }>([]);

  enter(ctx: GameContext): void {
    this.refresh(ctx);
  }

  exit(): void {}

  handleInput(ctx: GameContext, action: InputAction): void {
    if (action.type === "up") this.menu.moveUp();
    if (action.type === "down") this.menu.moveDown();
    if (action.type === "cancel") ctx.scenes.pop(ctx);
    if (action.type === "confirm") {
      const selected = this.menu.getSelected().value;
      ctx.scenes.push(new SaveSlotActionScene(selected.slot, selected.isEmpty), ctx);
    }
  }

  render(ctx: GameContext, frame: Frame): void {
    this.refresh(ctx);
    const header = renderHeader("Save Slots", "Select a slot", Math.min(frame.width - 4, 60));
    const pos = centerPosition(frame.width, frame.height, header);
    frame.blit(pos.x, 1, header);

    const lines = this.menu.getLines();
    const startY = 10;
    for (let i = 0; i < lines.length; i++) {
      frame.write(4, startY + i, lines[i]);
    }
  }

  private refresh(ctx: GameContext): void {
    const slots = ctx.state.listSlots();
    this.menu.setOptions(
      slots.map((slot) => ({
        label: `[${slot.slot}] ${slot.name} ${slot.isEmpty ? "" : `(Lv ${slot.level})`}`,
        value: { slot: slot.slot, isEmpty: slot.isEmpty },
      }))
    );
  }
}
