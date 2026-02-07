import type { Scene } from "../engine/Scene.js";
import type { Frame } from "../engine/Frame.js";
import type { InputAction } from "../engine/types.js";
import type { GameContext } from "../game/context.js";
import { MenuModel } from "../ui/MenuModel.js";
import { renderHeader, centerPosition } from "../ui/layout.js";
import { SaveSelectScene } from "./SaveSelectScene.js";
import { SettingsScene } from "./SettingsScene.js";

export class MainMenuScene implements Scene<GameContext> {
  private menu = new MenuModel([
    { label: "Play", value: "play" },
    { label: "Settings", value: "settings" },
    { label: "Exit", value: "exit" },
  ]);

  enter(): void {}
  exit(): void {}

  handleInput(ctx: GameContext, action: InputAction): void {
    if (action.type === "up") this.menu.moveUp();
    if (action.type === "down") this.menu.moveDown();
    if (action.type === "confirm") {
      const choice = this.menu.getSelected().value;
      if (choice === "play") ctx.scenes.push(new SaveSelectScene(), ctx);
      if (choice === "settings") ctx.scenes.push(new SettingsScene(), ctx);
      if (choice === "exit") ctx.engine.stop();
    }
  }

  render(ctx: GameContext, frame: Frame): void {
    const header = renderHeader("Final Realm", "Roguelite CLI", Math.min(frame.width - 4, 60));
    const pos = centerPosition(frame.width, frame.height, header);
    frame.blit(pos.x, 1, header);

    const menuLines = this.menu.getLines();
    const startY = 10;
    for (let i = 0; i < menuLines.length; i++) {
      frame.write(4, startY + i, menuLines[i]);
    }
  }
}
