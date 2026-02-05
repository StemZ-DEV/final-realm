/**
 * 
 * 	Final-Realm by StemZ
 * 	Attempted to comment/doc as much as possible, not the best at that though so I apologise to anyone
 * 	reading the src :rofl:
 * 
 */

import { Engine } from "./core/Engine";
import { MainMenuScene } from "./scenes/MainMenuScene";

async function main() {
	Engine.getSceneManager().push(new MainMenuScene());

	await Engine.run();
}

main().catch(console.error);