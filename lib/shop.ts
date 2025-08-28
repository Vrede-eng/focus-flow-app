
import { PREDEFINED_AVATARS } from './avatars';
import { THEMES } from './themes';
import { FRAMES } from './frames';
import { PETS } from './pets';
import { FONTS } from './fonts';
import { USERNAME_COLORS, COLOR_PACKS } from './username_colors';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    type: 'consumable' | 'theme' | 'avatar' | 'frame' | 'feature' | 'pet' | 'font' | 'color';
}

export const SHOP_ITEMS: ShopItem[] = [
    // --- CONSUMABLES ---
    {
        id: 'consumable-streak-shield',
        name: 'Streak Shield',
        description: 'Automatically saves your streak for one missed day. You can only hold one at a time.',
        price: 2500,
        type: 'consumable',
    },
    {
        id: 'consumable-xp-potion-100',
        name: 'XP Potion',
        description: 'Instantly gain 100 XP to boost your level progress.',
        price: 100,
        type: 'consumable',
    },
    // --- FEATURES ---
     {
        id: 'feature-custom-avatar',
        name: 'Custom Avatar',
        description: 'Unlock the ability to upload your own custom profile picture.',
        price: 5000,
        type: 'feature',
    },
    {
        id: 'feature-custom-status',
        name: 'Custom Status',
        description: 'Unlock the ability to set your own custom status on your profile.',
        price: 2000,
        type: 'feature',
    },
     {
        id: 'feature-custom-hat',
        name: 'Custom Hat',
        description: 'Unlock the ability to upload a custom image to wear as a hat over your avatar.',
        price: 7500,
        type: 'feature',
    },
    {
        id: 'feature-custom-pet',
        name: 'Custom Pet',
        description: 'Unlock the ability to upload a custom image to use as your profile pet.',
        price: 10000,
        type: 'feature',
    },
    {
        id: 'feature-profile-theme',
        name: 'Custom Profile Theme',
        description: 'Unlock the ability to set a custom color or image background on your profile page.',
        price: 8000,
        type: 'feature',
    },
    {
        id: 'hat-party-hat',
        name: 'Party Hat',
        description: 'A festive party hat for your avatar.',
        price: 2500,
        type: 'feature',
    },
    // --- USERNAME COLORS ---
    {
        id: 'username-color-gold',
        name: 'Gold Username',
        description: 'Permanently unlock the prestigious gold color for your username. A true status symbol.',
        price: 15000,
        type: 'color',
    },
    ...Object.entries(COLOR_PACKS).map(([id, pack]) => ({
        id,
        name: pack.name,
        description: pack.description,
        price: pack.price,
        type: 'color' as const,
    })),
    // --- FONTS ---
    ...Object.values(FONTS).map(font => ({
        id: font.id,
        name: `${font.name} Font`,
        description: `Unlock the "${font.name}" font for your username.`,
        price: font.price,
        type: 'font' as const,
    })),
    // --- THEMES (Dynamically generated from themes.ts, skipping the first 5 free ones) ---
    ...THEMES.slice(5).map(theme => ({
        id: theme.id,
        name: `${theme.name} Theme`,
        description: `Unlock the vibrant "${theme.name}" color theme for the entire app.`,
        price: 1500,
        type: 'theme' as const,
    })),
    // --- AVATARS (Dynamically generated, skipping the first 5 free ones) ---
    ...PREDEFINED_AVATARS.slice(5).map(avatarId => ({
        id: avatarId,
        name: `Avatar #${avatarId.split('-')[1]}`,
        description: 'A cool new avatar to customize your profile.',
        price: 500,
        type: 'avatar' as const,
    })),
    {
        id: 'avatar-neko',
        name: 'Neko Avatar',
        description: 'A cute, illustrated cat profile picture.',
        price: 1500,
        type: 'avatar',
    },
    // --- FRAMES (Dynamically generated from frames.ts) ---
     ...Object.values(FRAMES).map(frame => ({
        id: frame.id,
        name: `${frame.name} Frame`,
        description: `Equip the stylish "${frame.name}" frame around your avatar.`,
        price: frame.price,
        type: 'frame' as const,
    })),
    // --- PETS (Dynamically generated from pets.ts) ---
    ...Object.values(PETS).map(pet => ({
        id: pet.id,
        name: pet.name,
        description: `Adopt ${pet.name} as your profile companion!`,
        price: pet.price,
        type: 'pet' as const,
    })),
    {
        id: 'pet-chick',
        name: 'Happy Chick Pet',
        description: 'A cheerful little chick to accompany you on your profile.',
        price: 4000,
        type: 'pet',
    },
];
