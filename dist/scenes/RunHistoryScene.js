import { renderBox } from "../ui/layout.js";
export class RunHistoryScene {
    enter() { }
    exit() { }
    handleInput(ctx, action) {
        if (action.type === "cancel" || action.type === "confirm")
            ctx.scenes.pop(ctx);
    }
    render(ctx, frame) {
        const save = ctx.game.currentSave;
        if (!save)
            return;
        const lines = save.history.slice(0, 12).map((entry) => `${entry.timestamp.split("T")[0]} - ${entry.text}`);
        const content = lines.length ? lines.join("\n") : "No history yet.";
        const box = renderBox(content, Math.min(70, frame.width - 4), "Run History");
        frame.blit(2, 2, box);
    }
}
