// Fix: Add exports to make the file a module and provide a mock Supabase client.
// Setting supabase to null triggers the application's offline mode.
export const supabase = null;

export const getUserProfile = async (userId: string) => {
    // This function will not be called in offline mode.
    return null;
};
