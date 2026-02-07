import type { Scene } from "../engine/Scene.js";
import type { Frame } from "../engine/Frame.js";
import type { InputAction, ActionKey } from "../engine/types.js";
import type { GameContext } from "../game/context.js";
import { MenuModel } from "../ui/MenuModel.js";
import { renderBox, centerPosition } from "../ui/layout.js";

const ACTIONS: ActionKey[] = ["up", "down", "left", "right", "confirm", "cancel"];

export class KeybindScene implements Scene<GameContext> {
  transparent = true;
  modal = true;

  private menu = new MenuModel(
    ACTIONS.map((action) => ({ label: action.toUpperCase(), value: action }))
  );
  private mode: "select" | "capture" = "select";

  enter(): void {}
  exit(): void {}

  handleInput(ctx: GameContext, action: InputAction): void {
    if (this.mode === "capture") {
      if (action.type === "resize") return;
      const selected = this.menu.getSelected().value as ActionKey;
      const settings = ctx.settings.get();
      settings.keybinds[selected] = [action.raw];
      ctx.settings.set(settings);
      ctx.input.setKeybinds(settings.keybinds);
      this.mode = "select";
      return;
    }

    if (action.type === "up") this.menu.moveUp();
    if (action.type === "down") this.menu.moveDown();
    if (action.type === "confirm") this.mode = "capture";
    if (action.type === "cancel") ctx.scenes.pop(ctx);
  }

  render(ctx: GameContext, frame: Frame): void {
    const lines = this.menu.getLines().join("\n");
    const hint = this.mode === "capture" ? "Press any key..." : "Select an action to remap.";
    const box = renderBox(`${hint}\n\n${lines}`, Math.min(50, frame.width - 4), "Keybinds");
    const pos = centerPosition(frame.width, frame.height, box);
    frame.blit(pos.x, pos.y, box);
  }
}
