import { User } from '../types';

// Supabase client is always null to enforce offline mode.
export const supabase = null;

// This function will not be called in offline mode, but is kept for type consistency.
export const getUserProfile = async (userId: string): Promise<User | null> => {
    console.warn("getUserProfile called in offline mode. This should not happen.");
    return null;
};
