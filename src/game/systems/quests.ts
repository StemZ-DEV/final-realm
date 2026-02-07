import type { ContentRegistry } from "../../content/ContentRegistry.js";
import type { QuestLog, SaveData } from "../models.js";
import { addItem } from "./inventory.js";
import { nowIso } from "../utils.js";

export function createQuestLog(): QuestLog {
  return { active: [], completed: [] };
}

export function acceptQuest(save: SaveData, questId: string): string | null {
  if (save.quests.active.find((q) => q.id === questId)) return "Quest already active.";
  if (save.quests.completed.includes(questId)) return "Quest already completed.";
  save.quests.active.push({ id: questId, steps: [], completed: false });
  save.history.unshift({ timestamp: nowIso(), type: "quest", text: `Accepted quest ${questId}.` });
  return null;
}

export function recordKill(save: SaveData, registry: ContentRegistry, enemyId: string): string[] {
  const messages: string[] = [];
  for (const progress of save.quests.active) {
    const quest = registry.getQuest(progress.id);
    if (!quest) continue;
    if (quest.type !== "bounty") continue;

    quest.steps.forEach((step, index) => {
      if (step.target !== enemyId) return;
      progress.steps[index] = (progress.steps[index] ?? 0) + 1;
      if ((progress.steps[index] ?? 0) >= step.count) {
        messages.push(`${quest.name}: ${step.progressText ?? "Step complete."}`);
      }
    });

    const done = quest.steps.every((step, index) => (progress.steps[index] ?? 0) >= step.count);
    if (done && !progress.completed) {
      progress.completed = true;
      completeQuest(save, registry, quest.id, messages);
    }
  }
  return messages;
}

export function completeQuest(save: SaveData, registry: ContentRegistry, questId: string, messages: string[]): void {
  const quest = registry.getQuest(questId);
  if (!quest) return;

  save.quests.active = save.quests.active.filter((q) => q.id !== questId);
  save.quests.completed.push(questId);

  if (quest.rewards.gold) {
    save.player.gold += quest.rewards.gold;
    messages.push(`Gained ${quest.rewards.gold} gold.`);
  }
  if (quest.rewards.xp) {
    grantXp(save, quest.rewards.xp);
    messages.push(`Gained ${quest.rewards.xp} XP.`);
  }
  if (quest.rewards.items) {
    for (const item of quest.rewards.items) {
      addItem(save.player, registry, item.id, item.qty);
      messages.push(`Received ${item.qty}x ${registry.getItem(item.id)?.name ?? item.id}.`);
    }
  }

  save.history.unshift({ timestamp: nowIso(), type: "quest", text: `Completed quest ${quest.name}.` });
}

export function grantXp(save: SaveData, amount: number): void {
  let xp = save.player.xp + amount;
  while (xp >= save.player.xpToNextLevel) {
    xp -= save.player.xpToNextLevel;
    save.player.level += 1;
    save.player.attributePoints += 2;
    save.player.xpToNextLevel = Math.round(save.player.xpToNextLevel * 1.2);
    save.player.maxHp += 10;
    save.player.hp = save.player.maxHp;
  }
  save.player.xp = xp;
}
