import { renderBox, centerPosition } from "../ui/layout.js";
export class MessageScene {
    message;
    onClose;
    transparent = true;
    modal = true;
    constructor(message, onClose) {
        this.message = message;
        this.onClose = onClose;
    }
    enter() { }
    exit() {
        if (this.onClose)
            this.onClose();
    }
    handleInput(ctx, action) {
        if (action.type === "confirm" || action.type === "cancel") {
            ctx.scenes.pop(ctx);
        }
    }
    render(ctx, frame) {
        const content = `${this.message}\n\n${"Press Enter to continue."}`;
        const box = renderBox(content, Math.min(60, frame.width - 4), "Notice");
        const pos = centerPosition(frame.width, frame.height, box);
        frame.blit(pos.x, pos.y, box);
    }
}
