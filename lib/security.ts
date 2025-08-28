
import { User } from '../types';

// A simple, non-cryptographic hash function for data integrity checks.
// It's not for security in a cryptographic sense, but to detect accidental or intentional data modification in localStorage.
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
};

// This secret is not truly secret on the client-side, but it adds a layer of obscurity
// against casual tampering.
const CLIENT_SIDE_SECRET = 'focus-flow-integrity-key';

export const generateDataHash = (user: User): string => {
  // We select the key fields that determine a user's progress.
  // We stringify them to ensure consistent formatting.
  const dataToHash = JSON.stringify({
    name: user.name,
    level: user.level,
    xp: user.xp,
    streak: user.streak,
    lastStudiedDate: user.lastStudiedDate,
    studyLog: user.studyLog,
    achievements: user.achievements,
    friends: user.friends,
    createdAt: user.createdAt,
    prestige: user.prestige,
    // Shop data
    coins: user.coins,
    inventory: user.inventory,
    unlocks: user.unlocks,
    equippedFrame: user.equippedFrame,
    equippedHat: user.equippedHat,
    equippedPet: user.equippedPet,
    customPetUrl: user.customPetUrl,
    profileTheme: user.profileTheme,
    equippedFont: user.equippedFont,
    usernameColor: user.usernameColor,
  });

  return simpleHash(dataToHash + CLIENT_SIDE_SECRET);
};

export const verifyDataHash = (user: User): boolean => {
  if (!user.hash) {
    // If a user object from an older version has no hash, we can either
    // trust it or reject it. For now, we'll reject it to enforce security.
    return false;
  }
  const expectedHash = generateDataHash(user);
  return user.hash === expectedHash;
};


// Removes HTML tags to prevent basic XSS attacks.
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Enforces a simple rule for valid usernames.
export const isValidUsername = (name: string): boolean => {
  // Allows letters, numbers, and spaces.
  const regex = /^[a-zA-Z0-9 ]+$/;
  return regex.test(name) && name.trim().length > 0 && name.length <= 20;
};