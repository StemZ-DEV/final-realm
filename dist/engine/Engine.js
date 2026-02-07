import { Frame } from "./Frame.js";
export class Engine {
    ctx;
    input;
    renderer;
    scenes;
    running = false;
    pendingRender = false;
    onResize = null;
    constructor(ctx, input, renderer, scenes) {
        this.ctx = ctx;
        this.input = input;
        this.renderer = renderer;
        this.scenes = scenes;
    }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.renderer.start();
        this.input.start((action) => this.handleAction(action), () => this.stop());
        this.onResize = () => this.requestRender();
        process.stdout.on("resize", this.onResize);
        this.requestRender();
    }
    stop() {
        if (!this.running)
            return;
        this.running = false;
        if (this.onResize)
            process.stdout.off("resize", this.onResize);
        this.input.stop();
        this.renderer.stop();
        process.exit(0);
    }
    requestRender() {
        if (this.pendingRender)
            return;
        this.pendingRender = true;
        setImmediate(() => {
            this.pendingRender = false;
            this.render();
        });
    }
    render() {
        const { width, height } = this.renderer.getSize();
        const frame = new Frame(width, height);
        this.scenes.render(this.ctx, frame);
        this.renderer.render(frame);
    }
    handleAction(action) {
        if (!this.running)
            return;
        this.scenes.handleInput(this.ctx, action);
        this.requestRender();
    }
}
