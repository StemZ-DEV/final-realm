import type { Engine } from "../engine/Engine.js";
import type { Input } from "../engine/Input.js";
import type { Renderer } from "../engine/Renderer.js";
import type { SceneStack } from "../engine/SceneStack.js";
import type { ContentRegistry } from "../content/ContentRegistry.js";
import type { SettingsStore } from "./state/SettingsStore.js";
import type { SaveStore } from "./state/SaveStore.js";
import type { GameState } from "./models.js";

export interface GameContext {
  engine: Engine<GameContext>;
  input: Input;
  renderer: Renderer;
  scenes: SceneStack<GameContext>;
  settings: SettingsStore;
  state: SaveStore;
  registry: ContentRegistry;
  game: GameState;
}
