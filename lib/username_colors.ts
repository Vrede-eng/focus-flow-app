export interface UsernameColor {
    id: string;
    name: string;
    color: string;
}

export const USERNAME_COLORS: Record<string, UsernameColor> = {
    'gold': { id: 'gold', name: 'Gold', color: '#FFD700' },
    'cyan': { id: 'cyan', name: 'Cyan', color: '#00FFFF' },
    'magenta': { id: 'magenta', name: 'Magenta', color: '#FF00FF' },
    'lime': { id: 'lime', name: 'Lime Green', color: '#00FF00' },
    'orange': { id: 'orange', name: 'Bright Orange', color: '#FFA500' },
};

export const COLOR_PACKS: Record<string, { name: string; description: string; price: number; colors: string[] }> = {
    'username-color-pack-1': {
        name: 'Username Color Pack 1',
        description: 'Unlock Cyan, Magenta, Lime Green, and Bright Orange for your username.',
        price: 10000,
        colors: ['cyan', 'magenta', 'lime', 'orange'],
    },
};
