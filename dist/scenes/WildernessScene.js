import { MenuModel } from "../ui/MenuModel.js";
import { renderBox } from "../ui/layout.js";
import { rollEncounter } from "../game/systems/wilderness.js";
import { MessageScene } from "./MessageScene.js";
import { CombatScene } from "./CombatScene.js";
import { nowIso, randInt } from "../game/utils.js";
export class WildernessScene {
    menu = new MenuModel([]);
    enter(ctx) {
        const zones = Array.from(ctx.registry.zones.values());
        this.menu.setOptions(zones.map((zone) => ({ label: zone.name, value: zone.id })));
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
            const zoneId = this.menu.getSelected().value;
            const zone = ctx.registry.getZone(zoneId);
            if (!zone)
                return;
            const roll = rollEncounter(zone, ctx.registry);
            if (roll.type === "event") {
                if (roll.message.includes("coins") && ctx.game.currentSave) {
                    const gold = randInt(5, 12);
                    ctx.game.currentSave.player.gold += gold;
                    ctx.game.currentSave.history.unshift({
                        timestamp: nowIso(),
                        type: "loot",
                        text: `Found ${gold} gold while exploring.`,
                    });
                }
                ctx.scenes.push(new MessageScene(roll.message), ctx);
                return;
            }
            ctx.scenes.push(new CombatScene(zone, roll.enemyId, roll.variant), ctx);
        }
    }
    render(ctx, frame) {
        const lines = ["Choose a zone to explore:", "", ...this.menu.getLines()];
        const box = renderBox(lines.join("\n"), Math.min(60, frame.width - 4), "Wilderness");
        frame.blit(2, 2, box);
    }
}
