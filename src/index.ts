import { Engine } from "./engine/Engine.js";
import { Input } from "./engine/Input.js";
import { Renderer } from "./engine/Renderer.js";
import { SceneStack } from "./engine/SceneStack.js";
import { ContentRegistry } from "./content/ContentRegistry.js";
import { SaveStore } from "./game/state/SaveStore.js";
import { SettingsStore } from "./game/state/SettingsStore.js";
import { applySettings } from "./game/applySettings.js";
import type { GameContext } from "./game/context.js";
import type { GameState } from "./game/models.js";
import { MainMenuScene } from "./scenes/MainMenuScene.js";

async function main(): Promise<void> {
  const registry = new ContentRegistry();
  await registry.loadCoreContent("content/core");
  await registry.loadMods("mods", null);

  const settingsStore = new SettingsStore();
  applySettings(settingsStore.get());

  const input = new Input(settingsStore.get().keybinds);
  const renderer = new Renderer();
  const scenes = new SceneStack<GameContext>();
  const saveStore = new SaveStore();

  const gameState: GameState = { currentSave: null };
  const ctx = {} as GameContext;
  const engine = new Engine<GameContext>(ctx, input, renderer, scenes);

  Object.assign(ctx, {
    engine,
    input,
    renderer,
    scenes,
    settings: settingsStore,
    state: saveStore,
    registry,
    game: gameState,
  });

  scenes.push(new MainMenuScene(), ctx);
  engine.start();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
