import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Create a single supabase client for interacting with your database
// If the environment variables are not set, supabase will be null, and the app will run in offline mode.
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const getUserProfile = async (userId: string): Promise<User | null> => {
    if (!supabase) return null;
    
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            // Don't throw here, just return null to handle cases where a user exists in auth but not in the public table yet.
            return null;
        }

        return data as User;
    } catch (e) {
        console.error('An unexpected error occurred while fetching the user profile:', e);
        return null;
    }
};
