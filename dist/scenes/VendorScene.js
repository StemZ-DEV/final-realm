import { MenuModel } from "../ui/MenuModel.js";
import { renderBox, combineHorizontal } from "../ui/layout.js";
import { generateVendorStock, sellPrice } from "../game/systems/vendors.js";
import { addItem } from "../game/systems/inventory.js";
import { enchantCost, enchantItem } from "../game/systems/enchanting.js";
import { repairCost, repairItem } from "../game/systems/durability.js";
export class VendorScene {
    vendorId;
    mode = "menu";
    menu = new MenuModel([]);
    stock = [];
    constructor(vendorId) {
        this.vendorId = vendorId;
    }
    enter(ctx) {
        const vendor = ctx.registry.getVendor(this.vendorId);
        if (!vendor)
            return;
        this.stock = generateVendorStock(ctx.registry, vendor);
        this.setMenu(ctx, "menu");
    }
    exit() { }
    handleInput(ctx, action) {
        if (action.type === "up")
            this.menu.moveUp();
        if (action.type === "down")
            this.menu.moveDown();
        if (action.type === "cancel") {
            if (this.mode === "menu")
                return ctx.scenes.pop(ctx);
            this.setMenu(ctx, "menu");
            return;
        }
        if (action.type === "confirm") {
            const choice = this.menu.getSelected().value;
            if (this.mode === "menu") {
                if (choice === "Back")
                    return ctx.scenes.pop(ctx);
                this.setMenu(ctx, choice.toLowerCase());
                return;
            }
            if (this.mode === "buy")
                this.handleBuy(ctx, choice);
            if (this.mode === "sell")
                this.handleSell(ctx, choice);
            if (this.mode === "repair")
                this.handleRepair(ctx, choice);
            if (this.mode === "enchant")
                this.handleEnchant(ctx, choice);
        }
    }
    render(ctx, frame) {
        const save = ctx.game.currentSave;
        const vendor = ctx.registry.getVendor(this.vendorId);
        if (!save || !vendor)
            return;
        const title = `${vendor.name} (${this.mode})`;
        const left = renderBox(this.menu.getLines().join("\n"), 38, title);
        const right = renderBox(`Gold: ${save.player.gold}\n\nEsc: Back`, 30, "Info");
        const merged = combineHorizontal(left, right, 2);
        frame.blit(2, 2, merged);
    }
    setMenu(ctx, mode) {
        this.mode = mode;
        const vendor = ctx.registry.getVendor(this.vendorId);
        if (!vendor)
            return;
        if (mode === "menu") {
            const options = [...vendor.services.map((s) => capitalize(s)), "Sell", "Back"];
            this.menu.setOptions(options.map((opt) => ({ label: opt, value: opt })));
            return;
        }
        if (mode === "buy") {
            const options = this.stock.map((entry) => {
                const def = ctx.registry.getItem(entry.itemId);
                return `${def?.name ?? entry.itemId} - ${entry.price}g (x${entry.qty})`;
            });
            const list = options.length ? options : ["(Empty)"];
            this.menu.setOptions(list.map((opt) => ({ label: opt, value: opt })));
            return;
        }
        if (mode === "sell") {
            const options = ctx.game.currentSave?.player.inventory.map((item) => {
                const def = ctx.registry.getItem(item.id);
                const price = def ? sellPrice(def, item) : 1;
                return `${def?.name ?? item.id} - ${price}g`;
            }) ?? [];
            const list = options.length ? options : ["(Empty)"];
            this.menu.setOptions(list.map((opt) => ({ label: opt, value: opt })));
            return;
        }
        if (mode === "repair") {
            const options = buildEquipList(ctx.game.currentSave?.player.equipment ?? {}, ctx, (item, def) => {
                const cost = repairCost(def, item);
                return `${def.name} - ${cost}g`;
            });
            options.unshift("Repair All");
            this.menu.setOptions(options.map((opt) => ({ label: opt, value: opt })));
            return;
        }
        if (mode === "enchant") {
            const options = buildEquipList(ctx.game.currentSave?.player.equipment ?? {}, ctx, (item, def) => {
                const cost = enchantCost(def);
                return `${def.name} - ${cost}g`;
            });
            const list = options.length ? options : ["(Empty)"];
            this.menu.setOptions(list.map((opt) => ({ label: opt, value: opt })));
        }
    }
    handleBuy(ctx, choice) {
        const save = ctx.game.currentSave;
        if (!save)
            return;
        const index = this.menu.options.findIndex((opt) => opt.value === choice);
        const entry = this.stock[index];
        if (!entry)
            return;
        if (save.player.gold < entry.price)
            return;
        save.player.gold -= entry.price;
        addItem(save.player, ctx.registry, entry.itemId, 1);
    }
    handleSell(ctx, choice) {
        const save = ctx.game.currentSave;
        if (!save)
            return;
        const index = this.menu.options.findIndex((opt) => opt.value === choice);
        const item = save.player.inventory[index];
        if (!item)
            return;
        const def = ctx.registry.getItem(item.id);
        if (!def)
            return;
        const price = sellPrice(def, item);
        save.player.gold += price;
        item.qty -= 1;
        if (item.qty <= 0)
            save.player.inventory.splice(index, 1);
        this.setMenu(ctx, "sell");
    }
    handleRepair(ctx, choice) {
        const save = ctx.game.currentSave;
        if (!save)
            return;
        if (choice === "Repair All") {
            for (const item of Object.values(save.player.equipment)) {
                if (!item)
                    continue;
                const def = ctx.registry.getItem(item.id);
                if (!def)
                    continue;
                const cost = repairCost(def, item);
                if (save.player.gold >= cost) {
                    save.player.gold -= cost;
                    repairItem(def, item);
                }
            }
            return;
        }
        const item = findEquipByLabel(save.player.equipment, ctx, choice);
        if (!item)
            return;
        const def = ctx.registry.getItem(item.id);
        if (!def)
            return;
        const cost = repairCost(def, item);
        if (save.player.gold < cost)
            return;
        save.player.gold -= cost;
        repairItem(def, item);
    }
    handleEnchant(ctx, choice) {
        const save = ctx.game.currentSave;
        if (!save)
            return;
        const item = findEquipByLabel(save.player.equipment, ctx, choice);
        if (!item)
            return;
        const def = ctx.registry.getItem(item.id);
        if (!def)
            return;
        const cost = enchantCost(def);
        if (save.player.gold < cost)
            return;
        save.player.gold -= cost;
        enchantItem(def, item);
    }
}
function buildEquipList(equipment, ctx, format) {
    const options = [];
    for (const item of Object.values(equipment)) {
        if (!item)
            continue;
        const def = ctx.registry.getItem(item.id);
        if (!def)
            continue;
        options.push(format(item, def));
    }
    return options;
}
function findEquipByLabel(equipment, ctx, label) {
    for (const item of Object.values(equipment)) {
        if (!item)
            continue;
        const def = ctx.registry.getItem(item.id);
        if (!def)
            continue;
        if (label.startsWith(def.name))
            return item;
    }
    return null;
}
function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
