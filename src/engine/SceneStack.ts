import type { Scene } from "./Scene.js";
import type { InputAction } from "./types.js";
import type { Frame } from "./Frame.js";

interface SceneEntry<TContext> {
  scene: Scene<TContext>;
  transparent: boolean;
  modal: boolean;
}

export class SceneStack<TContext> {
  private stack: SceneEntry<TContext>[] = [];

  push(scene: Scene<TContext>, ctx: TContext): void {
    scene.enter(ctx);
    this.stack.push({
      scene,
      transparent: Boolean(scene.transparent),
      modal: Boolean(scene.modal),
    });
  }

  pop(ctx: TContext): void {
    const entry = this.stack.pop();
    if (entry) entry.scene.exit(ctx);
  }

  replace(scene: Scene<TContext>, ctx: TContext): void {
    while (this.stack.length > 0) this.pop(ctx);
    this.push(scene, ctx);
  }

  current(): Scene<TContext> | null {
    return this.stack.length ? this.stack[this.stack.length - 1].scene : null;
  }

  handleInput(ctx: TContext, action: InputAction): void {
    const entry = this.stack[this.stack.length - 1];
    if (!entry) return;
    entry.scene.handleInput(ctx, action);
  }

  render(ctx: TContext, frame: Frame): void {
    if (!this.stack.length) return;

    let startIndex = this.stack.length - 1;
    for (let i = this.stack.length - 1; i >= 0; i--) {
      if (!this.stack[i].transparent) {
        startIndex = i;
        break;
      }
    }

    for (let i = startIndex; i < this.stack.length; i++) {
      this.stack[i].scene.render(ctx, frame);
    }
  }
}
