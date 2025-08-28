

import { User } from '../types';
import { PREDEFINED_AVATARS } from './avatars';
import { determineTitle, totalXpToReachLevel } from './levels';
import { getWeekIdentifier } from './time';
import { generateNewWeeklyGoals } from './goals';
import { generateDataHash } from './security';

const names = ["Alex", "Jordan", "Taylor", "Casey", "Riley", "Jamie", "Morgan", "Skyler", "Peyton", "Avery", "Cameron", "Rowan", "Quinn", "Parker", "Dakota", "Reese", "Finley", "Emerson", "Sawyer", "Hayden"];
const timezones = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'];
const statuses = ["Focused on my goals!", "Taking a short break", "Grinding hard today!", "Learning new things.", "Building my future.", "Consistency is key."];


// Helper to get a date string in YYYY-MM-DD format
const getDateString = (date: Date): string => date.toISOString().split('T')[0];

// Helper to generate random study logs
const generateStudyLog = () => {
    const log = [];
    const today = new Date();
    const numEntries = Math.floor(Math.random() * 100) + 10; // 10 to 110 entries
    for (let i = 0; i < numEntries; i++) {
        const date = new Date();
        date.setDate(today.getDate() - Math.floor(Math.random() * 90)); // logs in the last 90 days
        const hours = parseFloat((Math.random() * 4 + 0.5).toFixed(1)); // 0.5 to 4.5 hours
        log.push({ date: getDateString(date), hours });
    }
    return log;
};

// Helper to calculate level and XP from logs
const calculateStats = (studyLog: { date: string, hours: number }[]) => {
    const totalHours = studyLog.reduce((sum, entry) => sum + entry.hours, 0);
    const xp = Math.round(totalHours * 100);
    let level = 1;
    while (xp >= totalXpToReachLevel(level + 1)) {
        level++;
    }
    return { xp, level, totalHours };
};

export const createAdminUser = (): User => {
    // FIX: Removed 'password' which is not in User type. Changed type to User.
    const adminUser: User = {
        id: 'admin-user-id',
        name: 'ADMIN',
        password: 'admin', // Add default password
        profile_pic: 'avatar-20', // A distinct avatar
        level: 99,
        xp: 999999,
        streak: 999,
        last_studied_date: null,
        study_log: [],
        friends: [],
        friend_requests: [],
        timezone: 'UTC',
        theme: 'matrix',
        title: 'System Administrator',
        status: 'Overseeing the system.',
        is_private: true,
        weekly_goals: {
            weekIdentifier: getWeekIdentifier(new Date(), 'UTC'),
            goals: []
        },
        achievements: [],
        total_goals_completed: 0,
        created_at: String(Date.now()),
        isAdmin: true,
        prestige: 0,
        coins: 1000000,
        inventory: { streakShield: 1 },
        unlocks: ['*'], // Admin has everything unlocked
    };
    // FIX: Removed 'hash' which is not in User type.
    return { ...adminUser };
};

export const generateMockUsers = (): User[] => {
    const users: User[] = [];

    // Always add the admin user
    users.push(createAdminUser());

    for (let i = 0; i < 60; i++) {
        const name = `${names[i % names.length]}${i >= names.length ? Math.floor(i / names.length) : ''}`;
        const studyLog = generateStudyLog();
        const { xp, level, totalHours } = calculateStats(studyLog);
        
        const sortedLog = [...studyLog].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastStudiedDate = sortedLog.length > 0 ? sortedLog[0].date : null;
        const streak = Math.floor(Math.random() * 50);
        const timezone = timezones[i % timezones.length];
        
        const creationDate = new Date();
        creationDate.setDate(creationDate.getDate() - Math.floor(Math.random() * 90));

        // FIX: Removed 'password' which is not in User type. Changed property names to snake_case.
        const user: User = {
            id: `mock-user-${i}`,
            name,
            profile_pic: PREDEFINED_AVATARS[i % PREDEFINED_AVATARS.length],
            level,
            xp,
            streak,
            last_studied_date: lastStudiedDate,
            study_log: studyLog,
            friends: [],
            friend_requests: [],
            timezone: timezone,
            theme: 'blue',
            title: determineTitle(level, 0),
            status: statuses[i % statuses.length],
            is_private: Math.random() < 0.2,
            weekly_goals: {
                weekIdentifier: getWeekIdentifier(new Date(), timezone),
                goals: generateNewWeeklyGoals()
            },
            achievements: [],
            total_goals_completed: Math.floor(Math.random() * 20),
            created_at: String(creationDate.getTime()),
            isAdmin: false,
            prestige: 0,
            coins: Math.round(totalHours * 100 * (Math.random() * 0.5 + 0.25)), // Have spent some coins
            inventory: { streakShield: Math.random() > 0.8 ? 1 : 0 },
            unlocks: [
                'theme-blue', 'theme-emerald', 'theme-rose',
                'avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5'
            ],
        };

        // FIX: Removed 'hash' which is not in User type.
        users.push({
            ...user,
        });
    }

    // Create some friendships
    for(let i=0; i < users.length; i++) {
        if (users[i].isAdmin) continue; // Admin doesn't need mock friends
        const numFriends = Math.floor(Math.random() * 5);
        for (let j=0; j < numFriends; j++) {
            const friendIndex = Math.floor(Math.random() * users.length);
            if (i !== friendIndex && !users[friendIndex].isAdmin && !users[i].friends.includes(users[friendIndex].name)) {
                users[i].friends.push(users[friendIndex].name);
                users[friendIndex].friends.push(users[i].name);
            }
        }
    }
    
    // Re-hash users after adding friends
    // FIX: Removed 'hash' logic.
    return users.map(u => ({ ...u }));
};