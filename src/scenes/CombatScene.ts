import type { Scene } from "../engine/Scene.js";
import type { Frame } from "../engine/Frame.js";
import type { InputAction } from "../engine/types.js";
import type { GameContext } from "../game/context.js";
import type { ZoneDefinition } from "../game/models.js";
import { MenuModel } from "../ui/MenuModel.js";
import { renderBox, combineHorizontal } from "../ui/layout.js";
import {
  applyDamage,
  attackDamage,
  computePlayerStats,
  createEnemyInstance,
  consumeItem,
  grantLoot,
  tickStatuses,
} from "../game/systems/combat.js";
import { CombatItemScene } from "./CombatItemScene.js";
import { MessageScene } from "./MessageScene.js";
import { degradeEquipment } from "../game/systems/durability.js";
import { recordKill, grantXp } from "../game/systems/quests.js";
import { nowIso, randInt } from "../game/utils.js";

export class CombatScene implements Scene<GameContext> {
  private menu = new MenuModel([
    { label: "Attack", value: "attack" },
    { label: "Defend", value: "defend" },
    { label: "Use Item", value: "item" },
    { label: "Flee", value: "flee" },
  ]);
  private log: string[] = [];
  private enemy: ReturnType<typeof createEnemyInstance> | null = null;
  private playerGuard = false;

  constructor(
    private zone: ZoneDefinition,
    private enemyId: string,
    private variant: "normal" | "elite" | "boss" | "ambush"
  ) {}

  enter(ctx: GameContext): void {
    const def = ctx.registry.getEnemy(this.enemyId);
    if (!def || !ctx.game.currentSave) return;
    const diff = ctx.registry.difficulty;
    this.enemy = createEnemyInstance(def, this.zone.difficultyBias, ctx.game.currentSave.player.level, this.variant, diff);
    this.log = [`A ${this.enemy.name} appears!`];
  }

  exit(): void {}

  handleInput(ctx: GameContext, action: InputAction): void {
    if (!ctx.game.currentSave || !this.enemy) return;
    const player = ctx.game.currentSave.player;
    if (action.type === "up") this.menu.moveUp();
    if (action.type === "down") this.menu.moveDown();
    if (action.type === "cancel") ctx.scenes.pop(ctx);

    if (action.type === "confirm") {
      const choice = this.menu.getSelected().value;
      this.playerGuard = false;

      this.applyRoundStart(ctx);
      if (this.enemy.hp <= 0) {
        this.handleVictory(ctx);
        return;
      }
      if (player.hp <= 0) {
        this.handleDefeat(ctx);
        return;
      }

      if (choice === "attack") {
        const pStats = computePlayerStats(player, ctx.registry);
        const eStats = computeEnemyStats(this.enemy);
        const dmg = attackDamage(pStats, eStats);
        applyDamage(this.enemy, dmg);
        this.pushLog(`You hit for ${dmg} damage.`);
      }

      if (choice === "defend") {
        this.playerGuard = true;
        this.pushLog("You brace for impact.");
      }

      if (choice === "item") {
        ctx.scenes.push(
          new CombatItemScene((index) => {
            const item = player.inventory[index];
            if (!item) return;
            const msg = consumeItem(player, ctx.registry, item);
            if (item.qty <= 0) player.inventory.splice(index, 1);
            if (msg) this.pushLog(msg);
          }),
          ctx
        );
        return;
      }

      if (choice === "flee") {
        if (Math.random() < 0.4) {
          this.pushLog("You fled successfully.");
          ctx.scenes.pop(ctx);
          return;
        }
        this.pushLog("You failed to escape.");
      }

      if (this.enemy.hp <= 0) {
        this.handleVictory(ctx);
        return;
      }

      this.enemyTurn(ctx);

      if (player.hp <= 0) {
        this.handleDefeat(ctx);
      }
    }
  }

  render(ctx: GameContext, frame: Frame): void {
    if (!ctx.game.currentSave || !this.enemy) return;
    const player = ctx.game.currentSave.player;
    const pStats = computePlayerStats(player, ctx.registry);
    const leftLines = [
      `${player.name} (Lv ${player.level})`,
      `HP: ${player.hp}/${pStats.maxHp}`,
      `Gold: ${player.gold}`,
      "",
      ...this.menu.getLines(),
    ];

    const rightLines = [
      `${this.enemy.name} (${this.enemy.variant})`,
      `HP: ${this.enemy.hp}/${this.enemy.maxHp}`,
      `Level: ${this.enemy.level}`,
      "",
      "Combat Log:",
      ...this.log.slice(-6),
    ];

    const leftBox = renderBox(leftLines.join("\n"), 34, "Player");
    const rightBox = renderBox(rightLines.join("\n"), 42, "Enemy");
    const merged = combineHorizontal(leftBox, rightBox, 2);
    frame.blit(2, 2, merged);
  }

  private enemyTurn(ctx: GameContext): void {
    if (!ctx.game.currentSave || !this.enemy) return;
    const player = ctx.game.currentSave.player;
    const pStats = computePlayerStats(player, ctx.registry);
    const eStats = computeEnemyStats(this.enemy);
    let dmg = attackDamage(eStats, pStats);
    if (this.playerGuard) dmg = Math.floor(dmg * 0.5);
    applyDamage(player, dmg);
    this.pushLog(`${this.enemy.name} strikes for ${dmg} damage.`);
  }

  private applyRoundStart(ctx: GameContext): void {
    if (!ctx.game.currentSave || !this.enemy) return;
    const player = ctx.game.currentSave.player;
    tickStatuses(player, ctx.registry, (msg) => this.pushLog(msg));
    tickStatuses(this.enemy, ctx.registry, (msg) => this.pushLog(msg));
  }

  private handleVictory(ctx: GameContext): void {
    if (!ctx.game.currentSave || !this.enemy) return;
    const save = ctx.game.currentSave;
    const xp = Math.round(20 * ctx.registry.difficulty.xpScale);
    grantXp(save, xp);
    grantLoot(save.player, ctx.registry, this.enemy.lootTableId, (msg) => this.pushLog(msg));
    degradeEquipment(save.player);
    const questMsgs = recordKill(save, ctx.registry, this.enemy.id);
    questMsgs.forEach((msg) => this.pushLog(msg));
    save.history.unshift({ timestamp: nowIso(), type: "combat", text: `Defeated ${this.enemy.name}.` });
    ctx.scenes.pop(ctx);
  }

  private handleDefeat(ctx: GameContext): void {
    if (!ctx.game.currentSave || !this.enemy) return;
    const save = ctx.game.currentSave;
    const loss = Math.max(1, Math.floor(save.player.gold * ctx.registry.difficulty.goldLossPercent));
    save.player.gold = Math.max(0, save.player.gold - loss);
    save.player.hp = 1;
    save.history.unshift({
      timestamp: nowIso(),
      type: "death",
      text: `Lost to ${this.enemy.name} and paid ${loss}g in treatment.`,
    });
    ctx.scenes.pop(ctx);
    ctx.scenes.push(
      new MessageScene(
        `You lost the fight... You scurried to the pharmacy with 1 HP remaining. (-${loss}g)`
      ),
      ctx
    );
  }

  private pushLog(message: string): void {
    this.log.push(message);
  }
}

function computeEnemyStats(enemy: { stats: any; maxHp: number }): { stats: any; attack: number; defense: number; maxHp: number } {
  const attack = enemy.stats.strength * 2;
  const defense = enemy.stats.defense * 2;
  return { stats: enemy.stats, attack, defense, maxHp: enemy.maxHp };
}
