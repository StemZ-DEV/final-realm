import readline from "readline";
import { SceneManager } from "./SceneManager";

export class GameEngine {
	private sceneManager: SceneManager;
	private isRunning: boolean = false;

	constructor() {
		this.sceneManager = new SceneManager();
	}

	public getSceneManager(): SceneManager {
		return this.sceneManager;
	}

	/** Inf game loop */
	public async run(): Promise<void> {
		this.isRunning = true;

		if (process.stdin.isTTY) process.stdin.setRawMode(true);
		readline.emitKeypressEvents(process.stdin);
		process.stdin.resume();

		while (this.isRunning) {
			const currentScene = this.sceneManager.getCurrent();

			if (!currentScene) {
				console.error("No active scene! Exiting...");
				this.isRunning = false;
				break;
			}

			console.clear();
			currentScene.render();
			await currentScene.update();
		}
	}

	public stop(): void {
		this.isRunning = false;
		if (process.stdin.isTTY) process.stdin.setRawMode(false);
		process.stdin.pause();
		console.clear();
		process.exit(0);
	}
}

/** Export a single instance so "Engine" is accessable globally later if needed */
export const Engine = new GameEngine();
