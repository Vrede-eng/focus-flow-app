// lib/clans.ts

/**
 * Calculates the amount of Clan XP (CXP) needed to advance from the current level to the next.
 * The formula provides a smooth but increasing difficulty curve.
 * @param level The current level of the clan.
 * @returns The total CXP required to level up.
 */
export const cxpForClanLevelUp = (level: number): number => {
    if (level <= 0) return 100;
    // Exponential growth makes higher levels significantly harder.
    // e.g., Lvl 5 -> 6 needs ~350 CXP. Lvl 10 -> 11 needs ~1200 CXP.
    return Math.floor(150 * Math.pow(level, 1.3));
};

/**
 * Calculates the total cumulative CXP required to reach a specific level from level 1.
 * @param level The target level.
 * @returns The cumulative CXP needed.
 */
export const totalCxpToReachClanLevel = (level: number): number => {
    if (level <= 1) return 0;
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += cxpForClanLevelUp(i);
    }
    return total;
};

/**
 * Determines the daily perks (XP and Coins) all members of a clan receive.
 * Perks start at level 2 and scale up.
 * @param level The clan's current level.
 * @returns An object containing the daily XP and Coin rewards.
 */
export const getClanPerks = (level: number): { xp: number, coins: number } => {
    if (level < 2) return { xp: 0, coins: 0 };
    
    // Example scaling: 
    // Lvl 5 gives 40 XP, 20 Coins daily.
    // Lvl 10 gives 90 XP, 45 Coins daily.
    const dailyXp = 10 * (level - 1);
    const dailyCoins = 5 * (level - 1);
    
    return { xp: dailyXp, coins: dailyCoins };
};
