interface PrestigeInfo {
    cap: number;
    multiplier: number;
}

export const getPrestigeConfig = (prestige: number = 0): PrestigeInfo => {
    // Each prestige level adds 10 to the level cap and 0.5 to the XP multiplier.
    // P0: cap 20, mult 1.0
    // P1: cap 30, mult 1.5
    // etc.
    const cap = 20 + prestige * 10;
    const multiplier = 1.0 + prestige * 0.5;
    return { cap, multiplier };
};


export const xpForLevelUp = (currentLevel: number): number => {
    // Curve: 1hr (100xp) for L1->2, 75m (125xp) for L2->3, 90m (150xp) for L3->4 etc.
    // This is a 15-minute (25 XP) increase per level.
    return 100 + (currentLevel - 1) * 25;
};

export const totalXpToReachLevel = (level: number): number => {
    if (level <= 1) return 0;
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += xpForLevelUp(i);
    }
    return total;
};

export const determineTitle = (level: number, prestige: number = 0): string => {
    const prestigePrefix = prestige > 0 ? `[Prestige ${prestige}] ` : '';
    
    let baseTitle: string;
    if (level < 5) baseTitle = 'Newcomer';
    else if (level < 10) baseTitle = 'Apprentice';
    else if (level < 20) baseTitle = 'Journeyman';
    else if (level < 30) baseTitle = 'Adept';
    else if (level < 40) baseTitle = 'Expert';
    else if (level < 50) baseTitle = 'Master';
    else baseTitle = 'Grandmaster';
    
    return `${prestigePrefix}${baseTitle}`;
};
