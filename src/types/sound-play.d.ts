declare module "sound-play" {
	/**
	 * Plays a sound file from the specified path.
	 * @param path The absolute path to the .wav or .mp3 file.
	 * @param volume (Optional) Volume level (0.0 to 1.0) - Note: not all OS implementations support this.
	 */
	export function play(path: string, volume?: number): Promise<void>;
}
