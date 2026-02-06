import { Item, Enemy } from "../interfaces/Content";
import { Recipe } from "../interfaces/Recipe";

export class Registry {
    private static items: Map<string, Item> = new Map();
    private static enemies: Map<string, Enemy> = new Map();
    private static recipes: Map<string, Recipe> = new Map();

    static registerItem(item: Item) {
        this.items.set(item.id, item);
    }

    static getItem(id: string): Item | undefined {
        return this.items.get(id);
    }


    static registerEnemy(enemy: Enemy) {
        this.enemies.set(enemy.id, enemy);
    }

    static getEnemy(id: string): Enemy | undefined {
        const template = this.enemies.get(id);
        return template ? JSON.parse(JSON.stringify(template)) : undefined;
    }


    static registerRecipe(recipe: Recipe) {
        this.recipes.set(recipe.id, recipe);
    }

    static getRecipe(id: string): Recipe | undefined {
        return this.recipes.get(id);
    }

    static getAllRecipes(): Recipe[] {
        return Array.from(this.recipes.values());
    }

}