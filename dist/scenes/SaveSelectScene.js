import { MenuModel } from "../ui/MenuModel.js";
import { renderHeader, centerPosition } from "../ui/layout.js";
import { SaveSlotActionScene } from "./SaveSlotActionScene.js";
export class SaveSelectScene {
    menu = new MenuModel([]);
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
            const selected = this.menu.getSelected().value;
            ctx.scenes.push(new SaveSlotActionScene(selected.slot, selected.isEmpty), ctx);
        }
    }
    render(ctx, frame) {
        this.refresh(ctx);
        const header = renderHeader("Save Slots", "Select a slot", Math.min(frame.width - 4, 60));
        const pos = centerPosition(frame.width, frame.height, header);
        frame.blit(pos.x, 1, header);
        const lines = this.menu.getLines();
        const startY = 10;
        for (let i = 0; i < lines.length; i++) {
            frame.write(4, startY + i, lines[i]);
        }
    }
    refresh(ctx) {
        const slots = ctx.state.listSlots();
        this.menu.setOptions(slots.map((slot) => ({
            label: `[${slot.slot}] ${slot.name} ${slot.isEmpty ? "" : `(Lv ${slot.level})`}`,
            value: { slot: slot.slot, isEmpty: slot.isEmpty },
        })));
    }
}
