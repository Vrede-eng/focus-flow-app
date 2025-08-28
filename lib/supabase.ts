import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `
            <div style="color: white; background-color: #0f172a; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; padding: 2rem;">
                <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">Configuration Error</h1>
                <p style="color: #94a3b8; text-align: center;">The application is not configured correctly. Please ensure the Supabase URL and Key are set in the environment variables.</p>
            </div>
        `;
    }
    throw new Error("Supabase environment variables are missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
