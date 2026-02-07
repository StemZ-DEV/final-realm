import type { Scene } from "../engine/Scene.js";
import type { Frame } from "../engine/Frame.js";
import type { InputAction } from "../engine/types.js";
import type { GameContext } from "../game/context.js";
import { renderBox } from "../ui/layout.js";

export class RunHistoryScene implements Scene<GameContext> {
  enter(): void {}
  exit(): void {}

  handleInput(ctx: GameContext, action: InputAction): void {
    if (action.type === "cancel" || action.type === "confirm") ctx.scenes.pop(ctx);
  }

  render(ctx: GameContext, frame: Frame): void {
    const save = ctx.game.currentSave;
    if (!save) return;
    const lines = save.history.slice(0, 12).map((entry) => `${entry.timestamp.split("T")[0]} - ${entry.text}`);
    const content = lines.length ? lines.join("\n") : "No history yet.";
    const box = renderBox(content, Math.min(70, frame.width - 4), "Run History");
    frame.blit(2, 2, box);
  }
}
