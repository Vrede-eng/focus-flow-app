export interface Font {
    id: string;
    name: string;
    family: string;
    price: number;
}

export const FONTS: Record<string, Font> = {
    'font-tech-mono': {
        id: 'font-tech-mono',
        name: 'Tech Mono',
        family: "'Share Tech Mono', monospace",
        price: 3000,
    },
    'font-pixel-start': {
        id: 'font-pixel-start',
        name: 'Pixel Start',
        family: "'Press Start 2P', cursive",
        price: 4500,
    },
    'font-vt323': {
        id: 'font-vt323',
        name: 'Retro Terminal',
        family: "'VT323', monospace",
        price: 3500,
    },
    'font-bungee': {
        id: 'font-bungee',
        name: 'Bungee',
        family: "'Bungee', sans-serif",
        price: 4000,
    },
    'font-major-mono': {
        id: 'font-major-mono',
        name: 'Major Mono',
        family: "'Major Mono Display', monospace",
        price: 4000,
    },
    'font-orbitron': {
        id: 'font-orbitron',
        name: 'Orbitron',
        family: "'Orbitron', sans-serif",
        price: 4000,
    },
};