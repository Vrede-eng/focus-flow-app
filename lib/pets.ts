
interface Pet {
    id: string;
    name: string;
    price: number;
    svg: string;
}

export const PETS: Record<string, Pet> = {
    'pet-dog': {
        id: 'pet-dog',
        name: 'Loyal Dog',
        price: 3000,
        svg: `<svg viewBox="0 0 50 50"><path fill="#A0522D" d="M25,48 C-5,48 5,28 15,20 C25,12 35,12 45,20 C55,28 65,48 25,48 Z" /><circle fill="#FFF" cx="20" cy="28" r="4"/><circle fill="#FFF" cx="40" cy="28" r="4"/><circle fill="#000" cx="20" cy="28" r="2"/><circle fill="#000" cx="40" cy="28" r="2"/><path fill="#000" d="M30,38 Q35,42 40,38" stroke="black" stroke-width="2" fill="none" /></svg>`,
    },
    'pet-cat': {
        id: 'pet-cat',
        name: 'Sly Cat',
        price: 3000,
        svg: `<svg viewBox="0 0 50 50"><path fill="#808080" d="M10,45 C0,35 5,15 25,15 C45,15 50,35 40,45 Z" /><path fill="#808080" d="M10,20 L15,10 L20,20 Z" /><path fill="#808080" d="M40,20 L45,10 L50,20 Z" /><circle fill="#ADFF2F" cx="20" cy="30" r="4"/><circle fill="#ADFF2F" cx="40" cy="30" r="4"/><path d="M25,35 L35,35" stroke="black" stroke-width="2" /></svg>`,
    },
    'pet-panda': {
        id: 'pet-panda',
        name: 'Gentle Panda',
        price: 5000,
        svg: `<svg viewBox="0 0 50 50"><circle fill="#FFF" cx="25" cy="25" r="20"/><circle fill="#000" cx="15" cy="18" r="7"/><circle fill="#000" cx="35" cy="18" r="7"/><circle fill="#000" cx="15" cy="18" r="3" fill="#FFF"/><circle fill="#000" cx="35" cy="18" r="3" fill="#FFF"/><circle fill="#000" cx="25" cy="25" r="3"/><path d="M20,35 Q25,38 30,35" stroke="black" stroke-width="2" fill="none" /></svg>`,
    },
    'pet-fox': {
        id: 'pet-fox',
        name: 'Cunning Fox',
        price: 4500,
        svg: `<svg viewBox="0 0 50 50"><path fill="#FFA500" d="M25,48 L5,20 L45,20 Z" /><path fill="#FFF" d="M25,48 L15,30 L35,30 Z" /><circle fill="#000" cx="18" cy="25" r="2"/><circle fill="#000" cx="32" cy="25" r="2"/><path fill="#000" d="M25,30 L25,35" stroke-width="2"/></svg>`,
    },
    'pet-penguin': {
        id: 'pet-penguin',
        name: 'Waddling Penguin',
        price: 4000,
        svg: `<svg viewBox="0 0 50 50"><ellipse fill="#000" cx="25" cy="25" rx="15" ry="20"/><ellipse fill="#FFF" cx="25" cy="30" rx="10" ry="12"/><circle fill="#000" cx="20" cy="20" r="2"/><circle fill="#000" cx="30" cy="20" r="2"/><path fill="#FFA500" d="M25,25 L20,30 L30,30 Z" /></svg>`,
    },
    'pet-frog': {
        id: 'pet-frog',
        name: 'Hopping Frog',
        price: 2500,
        svg: `<svg viewBox="0 0 50 50"><circle fill="#32CD32" cx="25" cy="30" r="15"/><circle fill="#FFF" cx="18" cy="25" r="5"/><circle fill="#FFF" cx="32" cy="25" r="5"/><circle fill="#000" cx="18" cy="25" r="2"/><circle fill="#000" cx="32" cy="25" r="2"/><path d="M18,38 Q25,35 32,38" stroke="black" stroke-width="2" fill="none"/></svg>`,
    },
    'pet-owl': {
        id: 'pet-owl',
        name: 'Wise Owl',
        price: 6000,
        svg: `<svg viewBox="0 0 50 50"><path fill="#8B4513" d="M25,45 C10,45 10,20 25,15 C40,20 40,45 25,45 Z"/><circle fill="#FFD700" cx="18" cy="25" r="7"/><circle fill="#FFD700" cx="32" cy="25" r="7"/><circle fill="#000" cx="18" cy="25" r="3"/><circle fill="#000" cx="32" cy="25" r="3"/><path fill="#FFA500" d="M25,30 L22,35 L28,35 Z"/></svg>`,
    },
    'pet-bunny': {
        id: 'pet-bunny',
        name: 'Fluffy Bunny',
        price: 3500,
        svg: `<svg viewBox="0 0 50 50"><circle fill="#FFF" cx="25" cy="30" r="15"/><path fill="#FFC0CB" d="M15,15 Q18,5 20,15 Z"/><path fill="#FFC0CB" d="M35,15 Q32,5 30,15 Z"/><circle fill="#000" cx="20" cy="30" r="2"/><circle fill="#000" cx="30" cy="30" r="2"/><path d="M23,35 L27,35" stroke="black" stroke-width="1"/></svg>`,
    },
    'pet-bear': {
        id: 'pet-bear',
        name: 'Grizzly Bear',
        price: 4500,
        svg: `<svg viewBox="0 0 50 50"><circle fill="#8B4513" cx="25" cy="25" r="20"/><circle fill="#D2691E" cx="15" cy="15" r="5"/><circle fill="#D2691E" cx="35" cy="15" r="5"/><circle fill="#000" cx="20" cy="25" r="2"/><circle fill="#000" cx="30" cy="25" r="2"/><path d="M22,35 Q25,32 28,35" stroke="black" stroke-width="2" fill="none"/></svg>`,
    },
    'pet-tiger': {
        id: 'pet-tiger',
        name: 'Fierce Tiger',
        price: 5500,
        svg: `<svg viewBox="0 0 50 50"><circle fill="#FFA500" cx="25" cy="25" r="20"/><path d="M10,20 L15,15 L20,20" stroke="black" stroke-width="2"/><path d="M40,20 L35,15 L30,20" stroke="black" stroke-width="2"/><path d="M15,25 L10,30" stroke="black" stroke-width="2"/><path d="M35,25 L40,30" stroke="black" stroke-width="2"/><circle fill="#000" cx="20" cy="25" r="2"/><circle fill="#000" cx="30" cy="25" r="2"/></svg>`,
    },
};
