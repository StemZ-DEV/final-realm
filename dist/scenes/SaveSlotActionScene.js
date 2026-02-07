import { MenuModel } from "../ui/MenuModel.js";
import { renderBox, centerPosition } from "../ui/layout.js";
import { PromptScene } from "./PromptScene.js";
import { createNewSave } from "../game/systems/newGame.js";
import { MainHubScene } from "./MainHubScene.js";
import { MessageScene } from "./MessageScene.js";
export class SaveSlotActionScene {
    slot;
    isEmpty;
    transparent = true;
    modal = true;
    menu;
    constructor(slot, isEmpty) {
        this.slot = slot;
        this.isEmpty = isEmpty;
        this.menu = new MenuModel([
            { label: this.isEmpty ? "Start New" : "Load", value: "start" },
            { label: "Delete", value: "delete" },
            { label: "Back", value: "back" },
        ]);
    }
    enter() { }
    exit() { }
    handleInput(ctx, action) {
        if (action.type === "up")
            this.menu.moveUp();
        if (action.type === "down")
            this.menu.moveDown();
        if (action.type === "cancel")
            ctx.scenes.pop(ctx);
        if (action.type === "confirm") {
            const choice = this.menu.getSelected().value;
            if (choice === "back")
                return ctx.scenes.pop(ctx);
            if (choice === "delete") {
                ctx.state.delete(this.slot);
                ctx.scenes.pop(ctx);
                ctx.scenes.push(new MessageScene(`Slot ${this.slot} deleted.`), ctx);
                return;
            }
            if (choice === "start") {
                if (this.isEmpty) {
                    ctx.scenes.push(new PromptScene("Enter character name", (name) => {
                        const safeName = name || "Wanderer";
                        const save = createNewSave(safeName, this.slot);
                        ctx.state.save(this.slot, save);
                        ctx.game.currentSave = save;
                        ctx.scenes.replace(new MainHubScene(), ctx);
                    }), ctx);
                    return;
                }
                const loaded = ctx.state.load(this.slot);
                if (!loaded) {
                    ctx.scenes.push(new MessageScene("Failed to load save."), ctx);
                    return;
                }
                ctx.game.currentSave = loaded;
                ctx.scenes.replace(new MainHubScene(), ctx);
            }
        }
    }
    render(ctx, frame) {
        const lines = this.menu.getLines().join("\n");
        const box = renderBox(`Slot ${this.slot}\n\n${lines}`, 30, "Save Slot");
        const pos = centerPosition(frame.width, frame.height, box);
        frame.blit(pos.x, pos.y, box);
    }
}
