import type { Scene } from "../engine/Scene.js";
import type { Frame } from "../engine/Frame.js";
import type { InputAction } from "../engine/types.js";
import type { GameContext } from "../game/context.js";
import { TextInputModel } from "../ui/TextInputModel.js";
import { renderBox, centerPosition } from "../ui/layout.js";

export class PromptScene implements Scene<GameContext> {
  transparent = true;
  modal = true;
  private input: TextInputModel;

  constructor(private title: string, private onSubmit: (value: string) => void) {
    this.input = new TextInputModel("Enter text...");
  }

  enter(): void {}
  exit(): void {}

  handleInput(ctx: GameContext, action: InputAction): void {
    if (action.type === "confirm") {
      this.onSubmit(this.input.value.trim());
      ctx.scenes.pop(ctx);
      return;
    }
    if (action.type === "cancel") {
      ctx.scenes.pop(ctx);
      return;
    }

    this.input.handleInput(action);
  }

  render(ctx: GameContext, frame: Frame): void {
    const content = `${this.title}\n\n${this.input.render(30)}`;
    const box = renderBox(content, Math.min(50, frame.width - 4), "Input");
    const pos = centerPosition(frame.width, frame.height, box);
    frame.blit(pos.x, pos.y, box);
  }
}
