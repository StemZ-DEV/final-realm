export class SceneStack {
    stack = [];
    push(scene, ctx) {
        scene.enter(ctx);
        this.stack.push({
            scene,
            transparent: Boolean(scene.transparent),
            modal: Boolean(scene.modal),
        });
    }
    pop(ctx) {
        const entry = this.stack.pop();
        if (entry)
            entry.scene.exit(ctx);
    }
    replace(scene, ctx) {
        while (this.stack.length > 0)
            this.pop(ctx);
        this.push(scene, ctx);
    }
    current() {
        return this.stack.length ? this.stack[this.stack.length - 1].scene : null;
    }
    handleInput(ctx, action) {
        const entry = this.stack[this.stack.length - 1];
        if (!entry)
            return;
        entry.scene.handleInput(ctx, action);
    }
    render(ctx, frame) {
        if (!this.stack.length)
            return;
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
