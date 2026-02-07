import { MenuModel } from "../ui/MenuModel.js";
import { renderBox } from "../ui/layout.js";
import { computePlayerStats } from "../game/systems/combat.js";
const STAT_KEYS = ["strength", "defense", "agility", "intelligence", "wisdom", "vitality"];
export class StatsScene {
    menu = new MenuModel(STAT_KEYS.map((key) => ({ label: key, value: key })));
    enter() { }
    exit() { }
    handleInput(ctx, action) {
        const save = ctx.game.currentSave;
        if (!save)
            return;
        if (action.type === "up")
            this.menu.moveUp();
        if (action.type === "down")
            this.menu.moveDown();
        if (action.type === "cancel")
            ctx.scenes.pop(ctx);
        if (action.type === "confirm") {
            const stat = this.menu.getSelected().value;
            if (save.player.attributePoints > 0) {
                save.player.stats[stat] += 1;
                save.player.attributePoints -= 1;
            }
        }
    }
    render(ctx, frame) {
        const save = ctx.game.currentSave;
        if (!save)
            return;
        const derived = computePlayerStats(save.player, ctx.registry);
        const lines = [];
        lines.push(`${save.player.name} (Lv ${save.player.level})`);
        lines.push(`HP: ${save.player.hp}/${derived.maxHp}`);
        lines.push(`Gold: ${save.player.gold}`);
        lines.push(`Attribute Points: ${save.player.attributePoints}`);
        lines.push("");
        const statsLines = this.menu.getLines().map((line, index) => {
            const key = STAT_KEYS[index];
            return `${line} (${save.player.stats[key]})`;
        });
        const box = renderBox(lines.concat(statsLines).join("\n"), Math.min(50, frame.width - 4), "Stats");
        frame.blit(2, 2, box);
    }
}
