import { MenuModel } from "../ui/MenuModel.js";
import { renderBox } from "../ui/layout.js";
import { acceptQuest } from "../game/systems/quests.js";
import { MessageScene } from "./MessageScene.js";
export class QuestBoardScene {
    menu = new MenuModel([]);
    questIds = [];
    enter(ctx) {
        this.refresh(ctx);
    }
    exit() { }
    handleInput(ctx, action) {
        if (action.type === "up")
            this.menu.moveUp();
        if (action.type === "down")
            this.menu.moveDown();
        if (action.type === "cancel")
            ctx.scenes.pop(ctx);
        if (action.type === "confirm") {
            const index = this.menu.getSelected().value;
            const questId = this.questIds[Number(index)];
            if (!questId || !ctx.game.currentSave)
                return;
            const err = acceptQuest(ctx.game.currentSave, questId);
            if (err)
                ctx.scenes.push(new MessageScene(err), ctx);
            else
                ctx.scenes.push(new MessageScene("Quest accepted!"), ctx);
        }
    }
    render(ctx, frame) {
        const lines = ["Available Quests:", "", ...this.menu.getLines()];
        const box = renderBox(lines.join("\n"), Math.min(70, frame.width - 4), "Quest Board");
        frame.blit(2, 2, box);
    }
    refresh(ctx) {
        const save = ctx.game.currentSave;
        if (!save)
            return;
        const quests = Array.from(ctx.registry.quests.values());
        this.questIds = quests.map((q) => q.id);
        this.menu.setOptions(quests.map((q, index) => ({
            label: `${q.name} (${q.type})`,
            value: String(index),
        })));
    }
}
