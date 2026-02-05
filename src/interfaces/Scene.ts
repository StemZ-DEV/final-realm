export interface Scene {
    /** Call once when the scene is first pushed to the stack.
     * Use this to load data or play a transition animation (if implemented later).
     */
    enter(): void;

    /**
     * Called every frame to render the UI.
     * This should NOT handle input, strictly only drawing.
     */
    render(): void;

    /**
     * Called every frame to wait for user input.
     * Returns a Promise because Inquirer is async.
     */
    update(): Promise<void>;

    /**
     * Called when the scene is popped off the stack.
     * Use this to cleanup events or auto-save.
     */
    exit(): void;
}