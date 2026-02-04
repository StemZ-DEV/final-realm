import { Player, PlayerStats } from "../entities/player";
import { getItem } from "../data/items";

export function getTotalStats(player: Player): PlayerStats {
    const total: PlayerStats = {...player.stats};

    const addFn = (itemId?: string) => {
        if (!itemId) return;
        const item = getItem(itemId);
        if (!item || !item.stats) return;

        for (const key of Object.keys(item.stats)) {
            const k = key as keyof PlayerStats;
            if (typeof item.stats[k] === "number") {
                total[k] += (item.stats[k] as number);
            }
        }
    };

    addFn(player.equipment.mainHand);
    addFn(player.equipment.armor);

    return total;
}