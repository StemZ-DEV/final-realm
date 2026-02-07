import type { Frame } from "./Frame.js";
import type { InputAction } from "./types.js";

export interface Scene<TContext> {
  transparent?: boolean;
  modal?: boolean;

  enter(ctx: TContext): void;
  exit(ctx: TContext): void;
  handleInput(ctx: TContext, action: InputAction): void;
  render(ctx: TContext, frame: Frame): void;
}
