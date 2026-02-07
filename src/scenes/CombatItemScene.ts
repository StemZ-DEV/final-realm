import type { Scene } from "../engine/Scene.js";
import type { Frame } from "../engine/Frame.js";
import type { InputAction } from "../engine/types.js";
import type { GameContext } from "../game/context.js";
import { MenuModel } from "../ui/MenuModel.js";
import { renderBox, centerPosition } from "../ui/layout.js";

export class CombatItemScene implements Scene<GameContext> {
  transparent = true;
  modal = true;

  private menu = new MenuModel<{ index: number; label: string }>([]);

  constructor(private onSelect: (index: number) => void) {}

  enter(ctx: GameContext): void {
    const save = ctx.game.currentSave;
    if (!save) return;
    const options = save.player.inventory
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => ctx.registry.getItem(item.id)?.type === "consumable")
      .map(({ item, index }) => {
        const def = ctx.registry.getItem(item.id);
        return { label: `${def?.name ?? item.id} x${item.qty}`, index };
      });

    if (!options.length) {
      this.menu.setOptions([{ label: "(No consumables)", value: { index: -1, label: "" } }]);
      return;
    }
    this.menu.setOptions(options.map((opt) => ({ label: opt.label, value: opt })));
  }

  exit(): void {}

  handleInput(ctx: GameContext, action: InputAction): void {
    if (action.type === "up") this.menu.moveUp();
    if (action.type === "down") this.menu.moveDown();
    if (action.type === "cancel") ctx.scenes.pop(ctx);
    if (action.type === "confirm") {
      const selected = this.menu.getSelected().value;
      if (selected.index >= 0) this.onSelect(selected.index);
      ctx.scenes.pop(ctx);
    }
  }

  render(ctx: GameContext, frame: Frame): void {
    const box = renderBox(this.menu.getLines().join("\n"), 40, "Consumables");
    const pos = centerPosition(frame.width, frame.height, box);
    frame.blit(pos.x, pos.y, box);
  }
}
