import { Registry } from "../core/Registry";

export function loadContent() {
    Registry.registerItem({
        id: "mat_iron_ingot",
        name: "Iron Ingot",
        type: "material",
        rarity: "common",
        description: "A heavy bar of refined iron.",
        value: 5
    });

    Registry.registerItem({
        id: "mat_wood_plank",
        name: "Oak Plank",
        type: "material",
        rarity: "common",
        description: "Hard but somewhat flimsy wood for handles.",
        value: 2
    });


    Registry.registerItem({
        id: "weap_iron_sword",
        name: "Iron Longsword",
        type: "weapon",
        slot: "primary",
        rarity: "uncommon",
        description: "A reliable soldier's blade.",
        value: 50,
        damage: 8,
        stats: { strength: 1 } 
    });

    Registry.registerItem({
        id: "acc_ring_fire",
        name: "Ruby Ring",
        type: "accessory",
        slot: "accessory",
        rarity: "rare",
        description: "Warm to the touch..",
        value: 150,
        stats: { intelligence: 3 }
    });


    Registry.registerRecipe({
        id: "recipe_iron_sword",
        name: "Forge Iron Longsword",
        ingredients: [
            { itemId: "mat_iron_ingot", quantity: 3 },
            { itemId: "mat_wood_plank", quantity: 1 }
        ],
        result: { itemId: "weap_iron_sword", quantity: 1 },
        goldCost: 10 // Blacksmith needs paying duhhh
    })
}