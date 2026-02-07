import type { Scene } from "../engine/Scene.js";
import type { Frame } from "../engine/Frame.js";
import type { InputAction } from "../engine/types.js";
import type { GameContext } from "../game/context.js";
import { MenuModel } from "../ui/MenuModel.js";
import { renderBox } from "../ui/layout.js";
import { KeybindScene } from "./KeybindScene.js";
import { applySettings } from "../game/applySettings.js";

export class SettingsScene implements Scene<GameContext> {
  private menu = new MenuModel([
    { label: "Center View", value: "centerView" },
    { label: "Disable Color", value: "disableColor" },
    { label: "High Contrast", value: "highContrast" },
    { label: "Reduced Motion", value: "reducedMotion" },
    { label: "Remap Keybinds", value: "keybinds" },
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
      if (choice === "keybinds") return ctx.scenes.push(new KeybindScene(), ctx);
      const settings = ctx.settings.get();
      const key = choice as keyof typeof settings;
      const current = settings[key];
      if (typeof current === "boolean") {
        settings[key] = !current as any;
        ctx.settings.set(settings);
        applySettings(settings);
      }
    }
  }

  render(ctx: GameContext, frame: Frame): void {
    const settings = ctx.settings.get();
    const lines = this.menu.getLines().map((line) => {
      const label = line.replace(/^[^A-Za-z]*/, "");
      if (label.includes("Center View")) return `${line} [${settings.centerView ? "ON" : "OFF"}]`;
      if (label.includes("Disable Color")) return `${line} [${settings.disableColor ? "ON" : "OFF"}]`;
      if (label.includes("High Contrast")) return `${line} [${settings.highContrast ? "ON" : "OFF"}]`;
      if (label.includes("Reduced Motion")) return `${line} [${settings.reducedMotion ? "ON" : "OFF"}]`;
      return line;
    });

    const box = renderBox(lines.join("\n"), Math.min(60, frame.width - 4), "Settings");
    frame.blit(2, 2, box);
  }
}
