import { TextInputModel } from "../ui/TextInputModel.js";
import { renderBox, centerPosition } from "../ui/layout.js";
export class PromptScene {
    title;
    onSubmit;
    transparent = true;
    modal = true;
    input;
    constructor(title, onSubmit) {
        this.title = title;
        this.onSubmit = onSubmit;
        this.input = new TextInputModel("Enter text...");
    }
    enter() { }
    exit() { }
    handleInput(ctx, action) {
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
    render(ctx, frame) {
        const content = `${this.title}\n\n${this.input.render(30)}`;
        const box = renderBox(content, Math.min(50, frame.width - 4), "Input");
        const pos = centerPosition(frame.width, frame.height, box);
        frame.blit(pos.x, pos.y, box);
    }
}
