import { Scene } from "../interfaces/Scene";

export class SceneManager {
    private stack: Scene[] = [];

    /** Push a new scene onto the stack (e.g. Inventory) */
    public push(scene: Scene): void {
        scene.enter();
        this.stack.push(scene);
    }

    /** Remove (pop) the top scene */
    public pop(): void {
        const scene = this.stack.pop();
        if (scene)
            scene.exit();
    }

    /** Get the current active scene (whichever is on top) */
    public getCurrent(): Scene | undefined {
        return this.stack[this.stack.length - 1];
    }

    /** Clear everything and start fresh (e.g. Back to main menu) */
    public switch(scene: Scene): void {
        while (this.stack.length > 0)
            this.pop();
        this.push(scene);
    }
}