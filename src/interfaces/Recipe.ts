export interface Ingredient {
    itemId: string;
    quantity: number;
}

export interface Recipe {
    id: string;
    name: string; // e.g. "Forge Iron Sword"
    ingredients: Ingredient[];
    result: {
        itemId: string;
        quantity: number;
    };
    goldCost?: number; // Does the blacksmith charge a fee?
    description?: string; // e.g. "Requires a hot forge."
}