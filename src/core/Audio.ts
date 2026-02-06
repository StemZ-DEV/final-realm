import * as sound from "sound-play";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

export class AudioManager {
	private static getPath(fileName: string): string {
		return path.join(process.cwd(), "src/assets/sfx", fileName);
	}

	static play(fileName: string, volume: number = 0.5) {
		const filePath = this.getPath(fileName);

		sound.play(filePath, volume).catch((err) => {});
	}

	static playNav() {
		this.play("menu_nav.wav");
	}
	static playSelect() {
		this.play("menu_select.wav");
	}
	static playStatUp() {
		this.play("stat_up.wav", 0.04);
	}
	static playSelect2() {
		this.play("menu_select_2.wav");
	}
	static playSave() {
		this.play("sys_save.wav", 0.5);
	}
}
