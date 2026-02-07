import { MenuModel } from "../ui/MenuModel.js";
import { renderHeader, centerPosition } from "../ui/layout.js";
import { TownScene } from "./TownScene.js";
import { WildernessScene } from "./WildernessScene.js";
import { InventoryScene } from "./InventoryScene.js";
import { StatsScene } from "./StatsScene.js";
import { SettingsScene } from "./SettingsScene.js";
import { RunHistoryScene } from "./RunHistoryScene.js";
import { MainMenuScene } from "./MainMenuScene.js";
export class MainHubScene {
    menu = new MenuModel([
        { label: "Town", value: "town" },
        { label: "Wilderness", value: "wild" },
        { label: "Inventory", value: "inventory" },
        { label: "Stats", value: "stats" },
        { label: "Run History", value: "history" },
        { label: "Settings", value: "settings" },
        { label: "Save & Quit", value: "savequit" },
    ]);
    enter() { }
    exit() { }
    handleInput(ctx, action) {
        if (!ctx.game.currentSave)
            return;
        if (action.type === "up")
            this.menu.moveUp();
        if (action.type === "down")
            this.menu.moveDown();
        if (action.type === "confirm") {
            const choice = this.menu.getSelected().value;
            if (choice === "town")
                ctx.scenes.push(new TownScene(), ctx);
            if (choice === "wild")
                ctx.scenes.push(new WildernessScene(), ctx);
            if (choice === "inventory")
                ctx.scenes.push(new InventoryScene(), ctx);
            if (choice === "stats")
                ctx.scenes.push(new StatsScene(), ctx);
            if (choice === "settings")
                ctx.scenes.push(new SettingsScene(), ctx);
            if (choice === "history")
                ctx.scenes.push(new RunHistoryScene(), ctx);
            if (choice === "savequit") {
                ctx.state.save(ctx.game.currentSave.slot, ctx.game.currentSave);
                ctx.game.currentSave = null;
                ctx.scenes.replace(new MainMenuScene(), ctx);
            }
        }
    }
    render(ctx, frame) {
        if (!ctx.game.currentSave) {
            const header = renderHeader("No Save Loaded", "Return to main menu", Math.min(frame.width - 4, 60));
            const pos = centerPosition(frame.width, frame.height, header);
            frame.blit(pos.x, 1, header);
            frame.write(4, 10, "Please select a save slot.");
            return;
        }
        const header = renderHeader("Town Square", `Welcome, ${ctx.game.currentSave.player.name}`, Math.min(frame.width - 4, 60));
        const pos = centerPosition(frame.width, frame.height, header);
        frame.blit(pos.x, 1, header);
        const lines = this.menu.getLines();
        const startY = 10;
        for (let i = 0; i < lines.length; i++) {
            frame.write(4, startY + i, lines[i]);
        }
    }
}
