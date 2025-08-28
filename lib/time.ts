export const getLocalDateString = (timezone?: string, date: Date = new Date()): string => {
    try {
        // 'en-CA' format is YYYY-MM-DD, which is robust for string comparisons
        return date.toLocaleDateString('en-CA', { timeZone: timezone || 'UTC' });
    } catch (e) {
        console.warn(`Invalid timezone: ${timezone}. Falling back to UTC.`);
        // Create a new date from the provided one to avoid modifying it
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }
};

export const getWeekIdentifier = (date: Date, timezone: string): string => {
    try {
        const d = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        const day = d.getDay(); // Sunday - 0, Monday - 1, ...
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        const monday = new Date(d.setDate(diff));
        return monday.toLocaleDateString('en-CA'); // YYYY-MM-DD of the Monday of that week
    } catch {
        const d = new Date(date);
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setUTCDate(diff));
        return monday.toISOString().split('T')[0];
    }
};