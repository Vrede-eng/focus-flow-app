
interface Frame {
    id: string;
    name: string;
    price: number;
    svg: string;
}

const frameStyles = `style="stroke-width: 3; fill: none;"`;

export const FRAMES: Record<string, Frame> = {
    'frame-bronze-ring': {
        id: 'frame-bronze-ring',
        name: 'Bronze Ring',
        price: 1000,
        svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" stroke="#CD7F32" ${frameStyles} /></svg>`,
    },
    'frame-silver-ring': {
        id: 'frame-silver-ring',
        name: 'Silver Ring',
        price: 2500,
        svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" stroke="#C0C0C0" ${frameStyles} /></svg>`,
    },
    'frame-gold-ring': {
        id: 'frame-gold-ring',
        name: 'Gold Ring',
        price: 5000,
        svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" stroke="#FFD700" ${frameStyles} /></svg>`,
    },
    'frame-dotted': {
        id: 'frame-dotted',
        name: 'Dotted',
        price: 3000,
        svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" stroke="var(--color-accent-primary)" stroke-dasharray="4 4" ${frameStyles} /></svg>`,
    },
    'frame-square': {
        id: 'frame-square',
        name: 'Square',
        price: 2000,
        svg: `<svg viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="10" stroke="#94a3b8" ${frameStyles} /></svg>`,
    },
    'frame-gradient': {
        id: 'frame-gradient',
        name: 'Gradient',
        price: 7500,
        svg: `<svg viewBox="0 0 100 100" style="fill: none; stroke-width: 3.5;">
            <defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" /><stop offset="100%" style="stop-color:#db2777;stop-opacity:1" /></linearGradient></defs>
            <circle cx="50" cy="50" r="48" stroke="url(#grad1)" /></svg>`,
    },
    'frame-laurel': {
        id: 'frame-laurel',
        name: 'Laurel',
        price: 10000,
        svg: `<svg viewBox="0 0 100 100"><path d="M 20 80 A 40 40 0 0 1 80 20 M 80 80 A 40 40 0 0 0 20 20" stroke="#FFD700" stroke-linecap="round" ${frameStyles} /></svg>`,
    },
    'frame-tech': {
        id: 'frame-tech',
        name: 'Tech',
        price: 6000,
        svg: `<svg viewBox="0 0 100 100"><path d="M 50 2 L 98 50 L 50 98 L 2 50 Z" stroke="#22d3ee" ${frameStyles} /></svg>`,
    },
    'frame-gears': {
        id: 'frame-gears',
        name: 'Gears',
        price: 8000,
        svg: `<svg viewBox="0 0 100 100" style="fill: none; stroke: #94a3b8; stroke-width: 2.5;">
            <circle cx="20" cy="20" r="10"/><circle cx="80" cy="20" r="10"/><circle cx="20" cy="80" r="10"/><circle cx="80" cy="80" r="10"/>
            <path d="M 30 20 H 70 M 20 30 V 70 M 30 80 H 70 M 80 30 V 70"/>
        </svg>`,
    },
    'frame-splash': {
        id: 'frame-splash',
        name: 'Splash',
        price: 4000,
        svg: `<svg viewBox="0 0 100 100"><path d="M 2 50 C 2 20, 20 2, 50 2 S 98 20, 98 50 C 98 80, 80 98, 50 98 C 20 98, 2 80, 2 50" stroke="#f43f5e" stroke-dasharray="20 5" stroke-linecap="round" ${frameStyles} /></svg>`,
    },
    'frame-royal': {
        id: 'frame-royal',
        name: 'Royal',
        price: 15000,
        svg: `<svg viewBox="0 0 100 100"><rect x="2" y="2" width="96" height="96" rx="15" stroke="#7c3aed" ${frameStyles} stroke-dasharray="1 5" stroke-linecap="round"/></svg>`,
    },
     'frame-star': {
        id: 'frame-star',
        name: 'Star',
        price: 12000,
        svg: `<svg viewBox="0 0 100 100"><path d="M50 2l12 35h38l-30 22 11 36-31-22-31 22 11-36-30-22h38z" stroke="#f59e0b" ${frameStyles}/></svg>`,
    },
    'frame-heart': {
        id: 'frame-heart',
        name: 'Heart',
        price: 9000,
        svg: `<svg viewBox="0 0 100 100"><path d="M50 30C30 10 10 30 10 50s40 40 40 40 40-20 40-40-20-40-40-20z" stroke="#e11d48" ${frameStyles}/></svg>`,
    },
     'frame-nature': {
        id: 'frame-nature',
        name: 'Nature',
        price: 11000,
        svg: `<svg viewBox="0 0 100 100"><path d="M50 2 A 48 48 0 0 1 50 98 A 48 48 0 0 1 50 2" stroke="#4CAF50" ${frameStyles}/>
        <path d="M50 98 C 40 80, 60 80, 50 65 C 40 50, 60 50, 50 35 C 40 20, 60 20, 50 2" stroke="#8BC34A" style="stroke-width: 2; fill: none;"/></svg>`,
    },
    'frame-crown': {
        id: 'frame-crown',
        name: 'Crown',
        price: 25000,
        svg: `<svg viewBox="0 0 100 100"><path d="M10 30 L 25 10 L 50 25 L 75 10 L 90 30 L 10 30 Z" fill="#FFD700"/><circle cx="25" cy="10" r="4" fill="#f43f5e"/><circle cx="50" cy="25" r="4" fill="#3b82f6"/><circle cx="75" cy="10" r="4" fill="#10b981"/></svg>`,
    }
};
