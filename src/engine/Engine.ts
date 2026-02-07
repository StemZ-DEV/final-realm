import { Frame } from "./Frame.js";
import { Input } from "./Input.js";
import { Renderer } from "./Renderer.js";
import { SceneStack } from "./SceneStack.js";
import type { InputAction } from "./types.js";

export class Engine<TContext> {
  private running = false;
  private pendingRender = false;
  private onResize: (() => void) | null = null;

  constructor(
    private ctx: TContext,
    private input: Input,
    private renderer: Renderer,
    private scenes: SceneStack<TContext>
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;

    this.renderer.start();
    this.input.start(
      (action) => this.handleAction(action),
      () => this.stop()
    );

    this.onResize = () => this.requestRender();
    process.stdout.on("resize", this.onResize);

    this.requestRender();
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.onResize) process.stdout.off("resize", this.onResize);
    this.input.stop();
    this.renderer.stop();
    process.exit(0);
  }

  requestRender(): void {
    if (this.pendingRender) return;
    this.pendingRender = true;
    setImmediate(() => {
      this.pendingRender = false;
      this.render();
    });
  }

  private render(): void {
    const { width, height } = this.renderer.getSize();
    const frame = new Frame(width, height);
    this.scenes.render(this.ctx, frame);
    this.renderer.render(frame);
  }

  private handleAction(action: InputAction): void {
    if (!this.running) return;
    this.scenes.handleInput(this.ctx, action);
    this.requestRender();
  }
}
