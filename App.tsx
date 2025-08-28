



import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleGenAI, Content, GenerateContentResponse } from "@google/genai";
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import HomePage from './components/home/HomePage';
import FriendsPage from './components/friends/FriendsPage';
import LeaderboardsPage from './components/leaderboards/LeaderboardsPage';
import SettingsPage from './components/settings/SettingsPage';
import BottomNav from './components/common/BottomNav';
import SideNav from './components/common/SideNav';
import AIAssistantPage from './components/assistant/AIAssistantPage';
import ProfilePage from './components/profile/ProfilePage';
import ChatView from './components/friends/ChatView';
import ClanChatView from './components/friends/ClanChatView';
import ChallengesPage from './components/challenges/ChallengesPage';
import AdminPage from './components/admin/AdminPage';
import ShopPage from './components/shop/ShopPage';
import NotificationModal from './components/common/NotificationModal';
import { Tab } from './constants';
import { User, ChatMessage, AIMessage, Theme, CoachMood, WeeklyGoal, WeeklyGoals, Clan, ClanInvite, ClanChatMessage } from './types';
import { PREDEFINED_AVATARS } from './lib/avatars';
import { THEMES } from './lib/themes';
import { SHOP_ITEMS } from './lib/shop';
import { ACHIEVEMENTS_LIST } from './lib/achievements';
import { xpForLevelUp, totalXpToReachLevel, determineTitle, getPrestigeConfig } from './lib/levels';
import { getLocalDateString, getWeekIdentifier } from './lib/time';
import { generateNewWeeklyGoals } from './lib/goals';
import { createAdminUser } from './lib/mockData';
import { generateDataHash, verifyDataHash, sanitizeInput, isValidUsername } from './lib/security';
import { COLOR_PACKS, USERNAME_COLORS } from './lib/username_colors';
// FIX: Import totalCxpToReachClanLevel to calculate clan level ups.
import { getClanPerks, cxpForClanLevelUp, totalCxpToReachClanLevel } from './lib/clans';

type UploadedFile = { name: string; type: string; data: string; };

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Home);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    
    // AI States
    const [plannerMessages, setPlannerMessages] = useState<AIMessage[]>([]);
    const [coachMessages, setCoachMessages] = useState<AIMessage[]>([]);
    const [answerBotMessages, setAnswerBotMessages] = useState<AIMessage[]>([]);
    const [helperBotMessages, setHelperBotMessages] = useState<AIMessage[]>([]);
    const [coachMood, setCoachMood] = useState<CoachMood>('motivational');
    const [plannerFile, setPlannerFile] = useState<UploadedFile | null>(null);
    const [coachFile, setCoachFile] = useState<UploadedFile | null>(null);
    const [answerBotFile, setAnswerBotFile] = useState<UploadedFile | null>(null);
    const [helperBotFile, setHelperBotFile] = useState<UploadedFile | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const [viewingProfile, setViewingProfile] = useState<User | null>(null);
    const [chattingWith, setChattingWith] = useState<User | null>(null);
    const [unreadSenders, setUnreadSenders] = useState<Set<string>>(new Set());
    const [notification, setNotification] = useState<{title: string, message: string} | null>(null);

    // Clan states
    const [allClans, setAllClans] = useState<Clan[]>([]);
    const [clanMessages, setClanMessages] = useState<ClanChatMessage[]>([]);
    const [chattingInClan, setChattingInClan] = useState<Clan | null>(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });


    useEffect(() => {
        // One-time setup on app load
        let users: User[];
        let clans: Clan[];
        let initialSaveNeeded = false;
        const storedUsersJSON = localStorage.getItem('focusFlowUsers');
        const storedClansJSON = localStorage.getItem('focusFlowClans');

        if (!storedUsersJSON || JSON.parse(storedUsersJSON).length === 0) {
            console.log("No users found. Initializing with admin user only.");
            users = [createAdminUser()];
            initialSaveNeeded = true;
        } else {
            users = JSON.parse(storedUsersJSON);
            if (!users.some(u => u.isAdmin)) {
                console.warn("Admin user missing. Re-creating admin user.");
                users.push(createAdminUser());
                initialSaveNeeded = true;
            }
        }
        
        clans = storedClansJSON ? JSON.parse(storedClansJSON) : [];

        // --- MIGRATION LOGIC ---
        let userLogicMadeChanges = false;
        let clanLogicMadeChanges = false;
        
        const usersWithLogicApplied = users.map(u => {
            let updatedUser = { ...u };
            let userChanged = false;

            if (typeof updatedUser.clanId === 'undefined') { updatedUser.clanId = undefined; userChanged = true; }
            if (typeof updatedUser.clanInvites === 'undefined') { updatedUser.clanInvites = []; userChanged = true; }
            if (typeof updatedUser.lastReadClanTimestamp === 'undefined') { updatedUser.lastReadClanTimestamp = 0; userChanged = true; }
            if (typeof updatedUser.coins === 'undefined') { updatedUser.coins = 0; userChanged = true; }
            if (typeof updatedUser.inventory === 'undefined') { updatedUser.inventory = { streakShield: 0 }; userChanged = true; }
            if (typeof updatedUser.unlocks === 'undefined') {
                updatedUser.unlocks = [ 'theme-blue', 'theme-emerald', 'theme-rose', 'theme-violet', 'theme-amber', 'avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5' ];
                userChanged = true;
            }
            if (typeof updatedUser.equippedFrame === 'undefined') { updatedUser.equippedFrame = undefined; userChanged = true; }
            if (typeof updatedUser.equippedHat === 'undefined') { updatedUser.equippedHat = undefined; userChanged = true; }
            if (typeof updatedUser.equippedPet === 'undefined') { updatedUser.equippedPet = undefined; userChanged = true; }
            if (typeof updatedUser.customPetUrl === 'undefined') { updatedUser.customPetUrl = undefined; userChanged = true; }
            if (typeof updatedUser.profileTheme === 'undefined') { updatedUser.profileTheme = undefined; userChanged = true; }
            if (typeof updatedUser.equippedFont === 'undefined') { updatedUser.equippedFont = undefined; userChanged = true; }
            if (typeof updatedUser.usernameColor === 'undefined') { updatedUser.usernameColor = undefined; userChanged = true; }

            // Streak check
            if (updatedUser.streak > 0 && updatedUser.lastStudiedDate) {
                const today = getLocalDateString(updatedUser.timezone);
                const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = getLocalDateString(updatedUser.timezone, yesterday);
                if (updatedUser.lastStudiedDate !== today && updatedUser.lastStudiedDate !== yesterdayStr) {
                    if (updatedUser.inventory?.streakShield && updatedUser.inventory.streakShield > 0) {
                        updatedUser.inventory.streakShield -= 1;
                        updatedUser.lastStudiedDate = yesterdayStr; 
                        if (u.name === user?.name) {
                           setNotification({ title: "Streak Saved!", message: `Your Streak Shield was automatically used to save your ${u.streak}-day streak. You can buy another one in the shop.` });
                        }
                    } else {
                        console.log(`Streak broken for ${updatedUser.name}. Resetting from ${updatedUser.streak} to 0.`);
                        updatedUser.streak = 0;
                    }
                    userChanged = true;
                }
            }
            if (typeof updatedUser.createdAt === 'undefined') {
                const earliestLog = updatedUser.studyLog?.length > 0 ? [...updatedUser.studyLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] : null;
                updatedUser.createdAt = earliestLog ? new Date(earliestLog.date).getTime() : Date.now();
                userChanged = true;
            }
             if (typeof updatedUser.prestige === 'undefined') {
                updatedUser.prestige = 0;
                userChanged = true;
            }
            if (userChanged) userLogicMadeChanges = true;
            return updatedUser;
        });
        
        const clansWithLogicApplied = clans.map(c => {
            let updatedClan = { ...c };
            let clanChanged = false;
            if (typeof updatedClan.level === 'undefined') { updatedClan.level = 1; clanChanged = true; }
            if (typeof updatedClan.cxp === 'undefined') { updatedClan.cxp = 0; clanChanged = true; }
            if (typeof updatedClan.banner === 'undefined') { updatedClan.banner = 'icon-1'; clanChanged = true; }
            if (typeof updatedClan.lastPerkClaimedDate === 'undefined') { updatedClan.lastPerkClaimedDate = ''; clanChanged = true; }
            if(clanChanged) clanLogicMadeChanges = true;
            return updatedClan;
        });

        // --- SIMULATED DAILY JOB FOR CLAN PERKS ---
        let updatedUsersFromPerks = [...usersWithLogicApplied];
        let updatedClansFromPerks = [...clansWithLogicApplied];
        const todayStr = getLocalDateString(); // Using UTC for the job date
        
        clansWithLogicApplied.forEach(clan => {
            if (clan.lastPerkClaimedDate !== todayStr) {
                const perks = getClanPerks(clan.level);
                if (perks.xp > 0 || perks.coins > 0) {
                    console.log(`Distributing perks for clan ${clan.name}`);
                    let didUpdateClan = false;
                    updatedUsersFromPerks = updatedUsersFromPerks.map(u => {
                        if (clan.members.includes(u.name)) {
                            didUpdateClan = true;
                            return { ...u, xp: u.xp + perks.xp, coins: (u.coins || 0) + perks.coins };
                        }
                        return u;
                    });
                    if (didUpdateClan) {
                        updatedClansFromPerks = updatedClansFromPerks.map(c => c.id === clan.id ? {...c, lastPerkClaimedDate: todayStr} : c);
                        clanLogicMadeChanges = true;
                        userLogicMadeChanges = true;
                    }
                }
            }
        });
        
        users = updatedUsersFromPerks;
        clans = updatedClansFromPerks;

        if (initialSaveNeeded || userLogicMadeChanges) {
            const usersToSave = users.map(u => ({ ...u, hash: generateDataHash(u) }));
            localStorage.setItem('focusFlowUsers', JSON.stringify(usersToSave));
        }
        if(clanLogicMadeChanges) {
             localStorage.setItem('focusFlowClans', JSON.stringify(clans));
        }

        const verifiedUsers = users.filter(u => {
            const isVerified = verifyDataHash(u);
            if (!isVerified) console.warn(`Data integrity check failed for user ${u.name}.`);
            return isVerified;
        });

        setAllUsers(verifiedUsers);
        setAllClans(clans);
        
        // Restore session
        try {
            const loggedInUserJSON = sessionStorage.getItem('focusFlowLoggedInUser');
            if (loggedInUserJSON) {
                const loggedInUser = JSON.parse(loggedInUserJSON);
                const fullUserFromStorage = verifiedUsers.find(u => u.name === loggedInUser.name);
                if (fullUserFromStorage) {
                    const { password, ...userToSet } = fullUserFromStorage;
                    setUser(userToSet);

                    const storedMessagesJSON = localStorage.getItem('focusFlowMessages');
                    if (storedMessagesJSON) {
                        const storedMessages: ChatMessage[] = JSON.parse(storedMessagesJSON);
                        const unread = new Set<string>();
                        storedMessages.forEach(msg => { if (msg.to === loggedInUser.name && !msg.read) unread.add(msg.from); });
                        setUnreadSenders(unread);
                        setMessages(storedMessages);
                    }
                    const storedClanMessages = localStorage.getItem('focusFlowClanMessages');
                    if (storedClanMessages) setClanMessages(JSON.parse(storedClanMessages));
                    
                    const storedPlannerMessages = localStorage.getItem('focusFlowPlannerMessages'); if (storedPlannerMessages) setPlannerMessages(JSON.parse(storedPlannerMessages));
                    const storedCoachMessages = localStorage.getItem('focusFlowCoachMessages'); if (storedCoachMessages) setCoachMessages(JSON.parse(storedCoachMessages));
                    const storedAnswerBotMessages = localStorage.getItem('focusFlowAnswerBotMessages'); if (storedAnswerBotMessages) setAnswerBotMessages(JSON.parse(storedAnswerBotMessages));
                    const storedHelperBotMessages = localStorage.getItem('focusFlowHelperBotMessages'); if (storedHelperBotMessages) setHelperBotMessages(JSON.parse(storedHelperBotMessages));
                    const storedCoachMood = localStorage.getItem('focusFlowCoachMood'); if (storedCoachMood) setCoachMood(storedCoachMood as CoachMood);
                }
            } else {
                const storedMessages = localStorage.getItem('focusFlowMessages'); if (storedMessages) setMessages(JSON.parse(storedMessages));
                const storedClanMessages = localStorage.getItem('focusFlowClanMessages'); if (storedClanMessages) setClanMessages(JSON.parse(storedClanMessages));
            }
        } catch (error) {
            console.error("Failed to restore session:", error);
            sessionStorage.removeItem('focusFlowLoggedInUser');
        }
    }, []);
    
    useEffect(() => {
        const themeId = user?.theme || 'blue';
        const selectedTheme = (THEMES.find(t => t.id === themeId) || THEMES[0]) as Theme;
        const root = document.documentElement;
        root.style.setProperty('--color-bg-primary', selectedTheme.bg.primary);
        root.style.setProperty('--color-bg-secondary', selectedTheme.bg.secondary);
        root.style.setProperty('--color-bg-tertiary', selectedTheme.bg.tertiary);
        root.style.setProperty('--color-text-primary', selectedTheme.text.primary);
        root.style.setProperty('--color-text-secondary', selectedTheme.text.secondary);
        root.style.setProperty('--color-text-placeholder', selectedTheme.text.placeholder);
        root.style.setProperty('--gradient-accent', selectedTheme.accent.gradient);
        root.style.setProperty('--color-accent-primary', selectedTheme.accent.primary);
        root.style.setProperty('--font-family-main', selectedTheme.font || "'Inter', sans-serif");
    }, [user?.theme]);

    useEffect(() => { if (user) localStorage.setItem('focusFlowPlannerMessages', JSON.stringify(plannerMessages)); }, [plannerMessages, user]);
    useEffect(() => { if (user) localStorage.setItem('focusFlowCoachMessages', JSON.stringify(coachMessages)); }, [coachMessages, user]);
    useEffect(() => { if (user) localStorage.setItem('focusFlowAnswerBotMessages', JSON.stringify(answerBotMessages)); }, [answerBotMessages, user]);
    useEffect(() => { if (user) localStorage.setItem('focusFlowHelperBotMessages', JSON.stringify(helperBotMessages)); }, [helperBotMessages, user]);
    useEffect(() => { if (user) localStorage.setItem('focusFlowCoachMood', coachMood); }, [coachMood, user]);
    useEffect(() => { if (user) localStorage.setItem('focusFlowClans', JSON.stringify(allClans)); }, [allClans, user]);
    useEffect(() => { if (user) localStorage.setItem('focusFlowClanMessages', JSON.stringify(clanMessages)); }, [clanMessages, user]);

    const updateUser = useCallback((updatedUser: User | null, updateAllUsers: boolean = true) => {
        setUser(updatedUser);
        if (updatedUser && updateAllUsers) {
            setAllUsers(prevUsers => {
                const userExists = prevUsers.some(u => u.name === updatedUser.name);
                const newUsers = userExists ? prevUsers.map(u => (u.name === updatedUser.name ? updatedUser : u)) : [...prevUsers, updatedUser];
                const usersToSave = newUsers.map(u => ({ ...u, hash: generateDataHash(u) }));
                localStorage.setItem('focusFlowUsers', JSON.stringify(usersToSave));
                return newUsers;
            });
        }
        if (updatedUser) {
             const { password, ...userToSet } = updatedUser;
            sessionStorage.setItem('focusFlowLoggedInUser', JSON.stringify(userToSet));
        } else {
            sessionStorage.removeItem('focusFlowLoggedInUser');
            setPlannerMessages([]); setCoachMessages([]); setAnswerBotMessages([]); setHelperBotMessages([]);
        }
    }, []);

    const handleLogin = useCallback(async (name: string, password: string): Promise<string | null> => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const userToLogin = allUsers.find(u => u.name.toLowerCase() === name.toLowerCase());
                if (userToLogin && userToLogin.password === password) {
                    const { password, ...userToSet } = userToLogin;
                    updateUser(userToLogin, false); // No need to update allUsers array here
                    resolve(null);
                } else {
                    resolve("Invalid username or password.");
                }
            }, 500);
        });
    }, [allUsers, updateUser]);

    const handleSignup = useCallback(async (name: string, password: string): Promise<string | null> => {
       return new Promise(resolve => {
           setTimeout(() => {
                const trimmedName = name.trim();
                if (!isValidUsername(trimmedName)) { resolve("Name must be 1-20 characters and contain only letters, numbers, and spaces."); return; }
                if (allUsers.find(u => u.name.toLowerCase() === trimmedName.toLowerCase())) { resolve("This username is already taken. Please choose another one."); } 
                else {
                    const newUser: User = {
                        name: trimmedName, password, profilePic: PREDEFINED_AVATARS[Math.floor(Math.random() * 5)],
                        level: 1, xp: 0, streak: 0, lastStudiedDate: null, studyLog: [], friends: [], friendRequests: [], clanInvites: [],
                        theme: 'blue', status: 'Ready to start my journey!',
                        weeklyGoals: { weekIdentifier: getWeekIdentifier(new Date(), 'UTC'), goals: generateNewWeeklyGoals(), },
                        totalGoalsCompleted: 0, achievements: [], createdAt: Date.now(), prestige: 0, coins: 0,
                        inventory: { streakShield: 0 },
                        unlocks: [ 'theme-blue', 'theme-emerald', 'theme-rose', 'theme-violet', 'theme-amber', 'avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5' ],
                        lastReadClanTimestamp: 0,
                    };
                    updateUser(newUser, true);
                    resolve(null);
                }
           }, 500);
       });
    }, [allUsers, updateUser]);

    const handleLogout = () => { updateUser(null); setActiveTab(Tab.Home); setAuthScreen('login'); };

    const handleLogHours = useCallback((hours: number) => {
        if (!user) return;
        const today = getLocalDateString(user.timezone);
        const prestigeInfo = getPrestigeConfig(user.prestige);
        const xpGained = Math.round(hours * 100 * prestigeInfo.multiplier);
        const coinsGained = Math.round(hours * 100 * prestigeInfo.multiplier);
        const newStudyLog = [...user.studyLog, { date: today, hours }];
        let newXp = user.xp + xpGained;
        let newLevel = user.level;
        let newPrestige = user.prestige || 0;
        
        let neededForNext = xpForLevelUp(newLevel);
        while (newXp - totalXpToReachLevel(newLevel) >= neededForNext) {
            newLevel++;
            neededForNext = xpForLevelUp(newLevel);
            setNotification({ title: "Level Up!", message: `Congratulations! You've reached Level ${newLevel}. Your new title is "${determineTitle(newLevel, newPrestige)}".` });
        }

        const prestigeCap = getPrestigeConfig(newPrestige).cap;
        if (newLevel >= prestigeCap) setNotification({ title: "Prestige Available!", message: `You've hit the level cap! You can now Prestige in the Shop to unlock a permanent XP & Coin boost, a new badge, and reset your level to 1 to climb again.` });
        
        let newStreak = user.streak;
        if (user.lastStudiedDate !== today) {
            const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = getLocalDateString(user.timezone, yesterday);
            if (user.lastStudiedDate === yesterdayStr) newStreak++;
            else newStreak = 1;
        }
        
        let updatedUser: User = { ...user, xp: newXp, level: newLevel, streak: newStreak, lastStudiedDate: today, studyLog: newStudyLog, coins: (user.coins || 0) + coinsGained, };
        
        if (updatedUser.weeklyGoals && updatedUser.weeklyGoals.goals) {
            const currentWeekIdentifier = getWeekIdentifier(new Date(), updatedUser.timezone);
            if (updatedUser.weeklyGoals.weekIdentifier !== currentWeekIdentifier) updatedUser.weeklyGoals = { weekIdentifier: currentWeekIdentifier, goals: generateNewWeeklyGoals() };
            else {
                let goalsCompletedThisLog = 0;
                const newGoals = updatedUser.weeklyGoals.goals.map(goal => {
                    if (goal.completed) return goal;
                    let isCompleted = false;
                    switch(goal.type) {
                        case 'log_hours_session': if (hours >= goal.target) isCompleted = true; break;
                        case 'reach_streak': if (newStreak >= goal.target) isCompleted = true; break;
                        case 'log_hours_weekly':
                            const hoursThisWeek = updatedUser.studyLog.filter(log => new Date(log.date) >= new Date(updatedUser.weeklyGoals!.weekIdentifier)).reduce((sum, log) => sum + log.hours, 0);
                            if (hoursThisWeek + hours >= goal.target) isCompleted = true;
                            break;
                    }
                    if (isCompleted) { goalsCompletedThisLog++; return { ...goal, completed: true }; }
                    return goal;
                });
                if (goalsCompletedThisLog > 0) {
                    updatedUser.xp += goalsCompletedThisLog * 50; updatedUser.totalGoalsCompleted = (updatedUser.totalGoalsCompleted || 0) + goalsCompletedThisLog; updatedUser.weeklyGoals.goals = newGoals;
                    setNotification({ title: "Goal Complete!", message: `You've completed ${goalsCompletedThisLog} weekly goal${goalsCompletedThisLog > 1 ? 's' : ''} and earned ${goalsCompletedThisLog * 50} bonus XP!` });
                }
            }
        }
        
        const unlockedAchievements = new Set((updatedUser.achievements || []).map(a => a.id));
        const newlyUnlocked = ACHIEVEMENTS_LIST.filter(ach => !unlockedAchievements.has(ach.id) && ach.check(updatedUser));
        if (newlyUnlocked.length > 0) {
            const newAchievements = newlyUnlocked.map(ach => ({ id: ach.id, unlockedAt: Date.now() }));
            updatedUser.achievements = [...(updatedUser.achievements || []), ...newAchievements];
            setNotification({ title: "Achievement Unlocked!", message: `${newlyUnlocked[0].name} - You've earned the title "${newlyUnlocked[0].reward.title}". You can equip it in Settings.` });
        }
        
        if (!updatedUser.equippedTitle) updatedUser.title = determineTitle(newLevel, newPrestige);
        
        // --- CLAN XP LOGIC ---
        if(user.clanId) {
            const clan = allClans.find(c => c.id === user.clanId);
            if(clan) {
                const cxpGained = Math.round(hours * 10); // 10 CXP per hour
                let updatedClan = {...clan, cxp: clan.cxp + cxpGained};
                
                let neededForNextClanLevel = cxpForClanLevelUp(updatedClan.level);
                while (updatedClan.cxp >= totalCxpToReachClanLevel(updatedClan.level) + neededForNextClanLevel) {
                    updatedClan.level++;
                    neededForNextClanLevel = cxpForClanLevelUp(updatedClan.level);
                    setNotification({ title: "Clan Level Up!", message: `Your clan, "${updatedClan.name}", has reached Level ${updatedClan.level}!` });
                }
                setAllClans(prev => prev.map(c => c.id === updatedClan.id ? updatedClan : c));
            }
        }

        updateUser(updatedUser);
    }, [user, updateUser, allClans]);

    const handleUpdateProfilePic = useCallback((newPic: string) => { if (!user) return; updateUser({ ...user, profilePic: newPic }); }, [user, updateUser]);
    const handleUpdateTimezone = useCallback((newTimezone: string) => { if (!user) return; updateUser({ ...user, timezone: newTimezone }); }, [user, updateUser]);
    const handleUpdateTheme = useCallback((newThemeId: string) => { if (!user) return; updateUser({ ...user, theme: newThemeId }); }, [user, updateUser]);
    const handleUpdateStatus = useCallback((newStatus: string) => { if (!user) return; updateUser({ ...user, status: sanitizeInput(newStatus) }); }, [user, updateUser]);
    const handleUpdatePrivacy = useCallback((isPrivate: boolean) => { if (!user) return; updateUser({ ...user, isPrivate }); }, [user, updateUser]);
    const handleEquipTitle = useCallback((title: string | null) => { if (!user) return; updateUser({ ...user, equippedTitle: title || undefined }); }, [user, updateUser]);
    const handleEquipFrame = useCallback((frameId: string | null) => { if (!user) return; updateUser({ ...user, equippedFrame: frameId || undefined }); }, [user, updateUser]);
    const handleUpdateHat = useCallback((newHat: string | null) => { if (!user) return; updateUser({ ...user, equippedHat: newHat || undefined }); }, [user, updateUser]);
    const handleEquipPet = useCallback((petId: string | null) => { if (!user) return; updateUser({ ...user, equippedPet: petId || undefined }); }, [user, updateUser]);
    const handleUpdateCustomPet = useCallback((petUrl: string | null) => { if (!user) return; updateUser({ ...user, customPetUrl: petUrl || undefined, equippedPet: petUrl ? 'custom' : user.equippedPet === 'custom' ? undefined : user.equippedPet }); }, [user, updateUser]);
    const handleUpdateProfileTheme = useCallback((bg: string) => { if (!user) return; updateUser({ ...user, profileTheme: { bg } }); }, [user, updateUser]);
    const handleEquipFont = useCallback((fontId: string | null) => { if (!user) return; updateUser({ ...user, equippedFont: fontId || undefined }); }, [user, updateUser]);
    const handleUpdateUsernameColor = useCallback((color: string | null) => { if (!user) return; updateUser({ ...user, usernameColor: color || undefined }); }, [user, updateUser]);

    const handleUpdateName = useCallback(async (newName: string): Promise<string | null> => {
        if (!user) return "Not logged in.";
        const trimmedName = newName.trim();
        if (trimmedName === user.name) return null;
        if (!isValidUsername(trimmedName)) return "Invalid name format.";
        if (allUsers.some(u => u.name.toLowerCase() === trimmedName.toLowerCase())) return "Name already taken.";

        const oldName = user.name;
        const updatedUser = { ...user, name: trimmedName };
        const updatedAllUsers = allUsers.map(u => {
            if (u.name === oldName) return updatedUser;
            const newFriends = u.friends?.map(f => f === oldName ? trimmedName : f);
            const newRequests = u.friendRequests?.map(r => r.from === oldName ? { ...r, from: trimmedName } : r);
            return { ...u, friends: newFriends, friendRequests: newRequests };
        });
        const updatedMessages = messages.map(msg => ({ ...msg, from: msg.from === oldName ? trimmedName : msg.from, to: msg.to === oldName ? trimmedName : msg.to, }));
        setMessages(updatedMessages); localStorage.setItem('focusFlowMessages', JSON.stringify(updatedMessages));
        const updatedAllClans = allClans.map(clan => ({...clan, leader: clan.leader === oldName ? trimmedName : clan.leader, members: clan.members.map(m => m === oldName ? trimmedName : m), }));
        setAllClans(updatedAllClans);
        const updatedClanMessages = clanMessages.map(msg => ({...msg, from: msg.from === oldName ? trimmedName : msg.from}));
        setClanMessages(updatedClanMessages);
        updateUser(updatedUser, false); 
        setAllUsers(() => {
            const usersToSave = updatedAllUsers.map(u => ({ ...u, hash: generateDataHash(u) }));
            localStorage.setItem('focusFlowUsers', JSON.stringify(usersToSave));
            return updatedAllUsers;
        });
        return null;
    }, [user, allUsers, messages, allClans, clanMessages, updateUser]);

    const handleUpdatePassword = useCallback(async (oldPass: string, newPass: string): Promise<string | null> => {
        if (!user) return "Not logged in.";
        const fullUser = allUsers.find(u => u.name === user.name);
        if (fullUser?.password !== oldPass) return "Incorrect current password.";
        updateUser({ ...user, password: newPass });
        return null;
    }, [user, allUsers, updateUser]);
    
    const handleSendRequest = useCallback((toUsername: string) => {
        if (!user) return;
        const recipient = allUsers.find(u => u.name === toUsername);
        if (!recipient || recipient.friendRequests.some(req => req.from === user.name)) return;
        const newRecipient = { ...recipient, friendRequests: [...recipient.friendRequests, { from: user.name, status: 'pending' as const }] };
        setAllUsers(prev => {
            const newUsers = prev.map(u => u.name === toUsername ? newRecipient : u);
            localStorage.setItem('focusFlowUsers', JSON.stringify(newUsers.map(u => ({...u, hash: generateDataHash(u)}))));
            return newUsers;
        });
    }, [user, allUsers]);

    const handleRespondRequest = useCallback((fromUsername: string, accept: boolean) => {
        if (!user) return;
        const sender = allUsers.find(u => u.name === fromUsername);
        if (!sender) return;
        const updatedCurrentUser = { ...user, friendRequests: user.friendRequests.filter(req => req.from !== fromUsername) };
        let updatedSender = { ...sender };
        if (accept) { updatedCurrentUser.friends = [...new Set([...user.friends, fromUsername])]; updatedSender.friends = [...new Set([...sender.friends, user.name])]; }
        setAllUsers(prev => {
            const newUsers = prev.map(u => {
                if (u.name === user.name) return updatedCurrentUser; if (u.name === fromUsername) return updatedSender; return u;
            });
            localStorage.setItem('focusFlowUsers', JSON.stringify(newUsers.map(u => ({...u, hash: generateDataHash(u)}))));
            return newUsers;
        });
        updateUser(updatedCurrentUser, false);
    }, [user, allUsers, updateUser]);
    
    const handleStartChat = useCallback((userToChat: User) => { setChattingWith(userToChat); setChattingInClan(null); }, []);
    const handleSendMessage = useCallback((to: string, text: string, type: 'text' | 'image', imageDataUrl?: string) => {
        if (!user) return;
        const newMessage: ChatMessage = { id: Date.now().toString() + Math.random(), from: user.name, to, text, timestamp: Date.now(), type, imageDataUrl, read: false, };
        setMessages(prev => { const newMessages = [...prev, newMessage]; localStorage.setItem('focusFlowMessages', JSON.stringify(newMessages)); return newMessages; });
    }, [user]);
    const handleMarkMessagesAsRead = useCallback((partnerName: string) => {
         if (!user) return; let changed = false;
        const newMessages = messages.map(msg => {
            if (msg.from === partnerName && msg.to === user.name && !msg.read) { changed = true; return { ...msg, read: true }; }
            return msg;
        });
        if (changed) {
            setMessages(newMessages); localStorage.setItem('focusFlowMessages', JSON.stringify(newMessages));
            setUnreadSenders(prev => { const newUnread = new Set(prev); newUnread.delete(partnerName); return newUnread; });
        }
    }, [user, messages]);
    const handleViewProfile = (username?: string) => { const userToView = allUsers.find(u => u.name === (username || user?.name)); if (userToView) setViewingProfile(userToView); };

    // Admin handlers
    const handleDeleteUser = useCallback((username: string) => { setAllUsers(prev => { const newUsers = prev.filter(u => u.name !== username); localStorage.setItem('focusFlowUsers', JSON.stringify(newUsers.map(u => ({ ...u, hash: generateDataHash(u) })))); return newUsers; }); }, []);
    const handleResetUser = useCallback((username: string) => { setAllUsers(prev => { const newUsers = prev.map(u => { if (u.name === username) return { ...u, level: 1, xp: 0, streak: 0, lastStudiedDate: null, studyLog: [], achievements: [], totalGoalsCompleted: 0, weeklyGoals: { weekIdentifier: getWeekIdentifier(new Date(), u.timezone || 'UTC'), goals: generateNewWeeklyGoals() }, } ; return u; }); localStorage.setItem('focusFlowUsers', JSON.stringify(newUsers.map(u => ({ ...u, hash: generateDataHash(u as User) })))); return newUsers; }); }, []);
    const handleUpdateUserStats = useCallback((username: string, newStats: any) => {
        setAllUsers(prev => {
            const newUsers = prev.map(u => {
                if (u.name === username) {
                    let mutableUser = { ...u, ...newStats }; let currentLevel = mutableUser.level; let currentPrestige = mutableUser.prestige || 0; let cap = getPrestigeConfig(currentPrestige).cap;
                    while (currentLevel >= cap) { currentLevel = (currentLevel - cap) + 1; currentPrestige++; cap = getPrestigeConfig(currentPrestige).cap; }
                    mutableUser.level = currentLevel; mutableUser.prestige = currentPrestige; mutableUser.xp = totalXpToReachLevel(currentLevel);
                    if (!mutableUser.equippedTitle) mutableUser.title = determineTitle(mutableUser.level, mutableUser.prestige);
                    else mutableUser.title = determineTitle(mutableUser.level, mutableUser.prestige);
                    return mutableUser;
                }
                return u;
            });
            const usersToSave = newUsers.map(u => ({ ...u, hash: generateDataHash(u) }));
            localStorage.setItem('focusFlowUsers', JSON.stringify(usersToSave));
            if (user && user.name === username) { const updatedCurrentUser = newUsers.find(u => u.name === username); if (updatedCurrentUser) { const { password, ...userToSet } = updatedCurrentUser; setUser(userToSet); } }
            return newUsers;
        });
    }, [user]);
    const handleDeleteClan = useCallback((clanId: string) => {
        const clanToDelete = allClans.find(c => c.id === clanId);
        if (!clanToDelete) return;

        setAllClans(prev => prev.filter(c => c.id !== clanId));
        
        const updatedUsers = allUsers.map(u => {
            if (clanToDelete.members.includes(u.name)) {
                return { ...u, clanId: undefined };
            }
            return u;
        });

        const usersToSave = updatedUsers.map(u => ({ ...u, hash: generateDataHash(u) }));
        localStorage.setItem('focusFlowUsers', JSON.stringify(usersToSave));
        setAllUsers(updatedUsers);

        if (user && user.clanId === clanId) {
            updateUser({ ...user, clanId: undefined }, false);
        }
    }, [allClans, allUsers, user, updateUser]);

    // Shop handlers
    const handlePurchase = useCallback((itemId: string) => {
        if (!user) return; const item = SHOP_ITEMS.find(i => i.id === itemId); if (!item || (user.coins || 0) < item.price) return;
        let updatedUser = { ...user }; updatedUser.coins = (updatedUser.coins || 0) - item.price;
        if (item.type === 'consumable') {
            updatedUser.inventory = updatedUser.inventory || {};
            if (item.id === 'consumable-streak-shield') { if ((updatedUser.inventory.streakShield || 0) >= 1) { alert("You can only hold one Streak Shield at a time."); return; } updatedUser.inventory.streakShield = 1; } 
            else if (item.id.startsWith('consumable-xp-potion')) { updatedUser.inventory.xpPotions = updatedUser.inventory.xpPotions || {}; updatedUser.inventory.xpPotions[item.id] = (updatedUser.inventory.xpPotions[item.id] || 0) + 1; }
        } else if (item.id.startsWith('username-color-pack')) {
             const pack = COLOR_PACKS[item.id]; if (pack) { const colorUnlocks = pack.colors.map(colorId => `color-${colorId}`); updatedUser.unlocks = [...new Set([...(updatedUser.unlocks || []), ...colorUnlocks, item.id])]; }
        } else { updatedUser.unlocks = [...new Set([...(updatedUser.unlocks || []), item.id])]; }
        updateUser(updatedUser); setNotification({ title: "Purchase Successful!", message: `You bought ${item.name} for ${item.price} coins.`});
    }, [user, updateUser]);
    const handleUseItem = useCallback((itemId: string) => {
        if (!user) return; if (itemId.startsWith('consumable-xp-potion-')) {
            const xpAmount = parseInt(itemId.split('-').pop() || '0'); if (xpAmount > 0) {
                const updatedUser = { ...user }; const currentPotions = updatedUser.inventory?.xpPotions?.[itemId] || 0;
                if (currentPotions > 0) {
                    updatedUser.inventory!.xpPotions![itemId] -= 1; setNotification({ title: "XP Gained!", message: `You used an XP Potion and gained ${xpAmount} XP!` });
                    let newXp = updatedUser.xp + xpAmount; let newLevel = updatedUser.level; let newPrestige = updatedUser.prestige || 0;
                    let neededForNext = xpForLevelUp(newLevel);
                    while (newXp >= totalXpToReachLevel(newLevel) + neededForNext) { newLevel++; neededForNext = xpForLevelUp(newLevel); setNotification({ title: "Level Up!", message: `Congratulations! You've reached Level ${newLevel}. Your new title is "${determineTitle(newLevel, newPrestige)}".` }); }
                    updatedUser.xp = newXp; updatedUser.level = newLevel; if (!updatedUser.equippedTitle) updatedUser.title = determineTitle(newLevel, newPrestige);
                    updateUser(updatedUser);
                }
            }
        }
    }, [user, updateUser]);

    // AI handlers
    const handleSetCoachMood = (mood: CoachMood) => { if (mood !== coachMood) setCoachMessages([]); setCoachMood(mood); };
    const handleSendAIGeneric = async (prompt: string, file: UploadedFile | null, currentMessages: AIMessage[], setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>, systemInstruction: string = '') => {
        if (!prompt && !file) return; setIsAiLoading(true);
        const userMessage: AIMessage = { id: Date.now().toString(), role: 'user', text: prompt, timestamp: Date.now() }; setMessages([...currentMessages, userMessage]);
        try {
            const contents: Content[] = [{ role: 'user', parts: [] }];
            if (file) contents[0].parts.push({ inlineData: { mimeType: file.type, data: file.data } });
            if (prompt) contents[0].parts.push({ text: prompt });
            const response: GenerateContentResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: contents, ...(systemInstruction && { config: { systemInstruction } }) });
            const modelMessage: AIMessage = { id: (Date.now() + 1).toString(), role: 'model', text: response.text, timestamp: Date.now() }; setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("AI Error:", error); const errorMessage: AIMessage = { id: (Date.now() + 1).toString(), role: 'model', text: "Sorry, I encountered an error. Please try again.", timestamp: Date.now() }; setMessages(prev => [...prev, errorMessage]);
        } finally { setIsAiLoading(false); }
    };

    // --- CLAN HANDLERS ---
    const handleCreateClan = useCallback(async (name: string): Promise<string | null> => {
        if (!user) return "You are not logged in."; if (user.clanId) return "You are already in a clan.";
        const trimmedName = name.trim();
        if (trimmedName.length < 3 || trimmedName.length > 20) return "Clan name must be 3-20 characters.";
        if (allClans.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) return "A clan with this name already exists.";

        const newClan: Clan = {
            id: Date.now().toString() + user.name, name: trimmedName, leader: user.name, members: [user.name], maxMembers: 10, createdAt: Date.now(),
            level: 1, cxp: 0, banner: 'icon-1',
        };
        setAllClans(prev => [...prev, newClan]);
        updateUser({ ...user, clanId: newClan.id });
        return null;
    }, [user, allClans, updateUser]);

    const handleInviteToClan = useCallback((username: string): string | null => {
        if (!user || !user.clanId) return "You are not in a clan.";
        const clan = allClans.find(c => c.id === user.clanId);
        if (!clan) return "Clan not found.";
        if (clan.leader !== user.name) return "Only the clan leader can send invites.";
        const targetUser = allUsers.find(u => u.name === username);
        if (!targetUser) return "User not found.";
        if (targetUser.clanId) return `${username} is already in a clan.`;
        if (targetUser.clanInvites?.some(inv => inv.clanId === clan.id)) return `Invite already sent to ${username}.`;

        const newInvite: ClanInvite = { clanId: clan.id, clanName: clan.name, from: clan.leader };
        const updatedTargetUser = { ...targetUser, clanInvites: [...(targetUser.clanInvites || []), newInvite] };
        setAllUsers(prev => prev.map(u => u.name === username ? updatedTargetUser : u));
        return null;
    }, [user, allClans, allUsers]);

    const handleRespondToClanInvite = useCallback((invite: ClanInvite, accept: boolean) => {
        if (!user) return;
        const clan = allClans.find(c => c.id === invite.clanId);
        const updatedUser: User = { ...user, clanInvites: (user.clanInvites || []).filter(inv => inv.clanId !== invite.clanId) };
        if (accept && clan) {
            if (clan.members.length >= clan.maxMembers) setNotification({title: "Clan Full", message: `Sorry, ${clan.name} is already full.`});
            else if (!user.clanId) {
                updatedUser.clanId = clan.id;
                const updatedClan = { ...clan, members: [...clan.members, user.name] };
                setAllClans(prev => prev.map(c => c.id === clan.id ? updatedClan : c));
            }
        }
        updateUser(updatedUser);
    }, [user, allClans, updateUser]);
    
    const handleLeaveClan = useCallback(() => {
        if (!user || !user.clanId) return;
        const clan = allClans.find(c => c.id === user.clanId);
        if (!clan) return;
        if (clan.leader === user.name) {
            setAllClans(prev => prev.filter(c => c.id !== clan.id));
            setAllUsers(prev => prev.map(u => clan.members.includes(u.name) ? { ...u, clanId: undefined } : u));
            setNotification({title: "Clan Disbanded", message: `As you were the leader, the clan "${clan.name}" has been disbanded.`});
            updateUser({...user, clanId: undefined});
        } else {
            const updatedClan = { ...clan, members: clan.members.filter(m => m !== user.name) };
            setAllClans(prev => prev.map(c => c.id === clan.id ? updatedClan : c));
            updateUser({ ...user, clanId: undefined });
        }
    }, [user, allClans, updateUser]);

    const handleKickFromClan = useCallback((username: string, clanId: string) => {
        if (!user || !user.clanId || user.clanId !== clanId) return;
        const clan = allClans.find(c => c.id === clanId);
        if (!clan || clan.leader !== user.name) return;
        const updatedClan = { ...clan, members: clan.members.filter(m => m !== username) };
        setAllClans(prev => prev.map(c => c.id === clanId ? updatedClan : c));
        setAllUsers(prev => prev.map(u => u.name === username ? { ...u, clanId: undefined } : u));
    }, [user, allClans]);

    const handleUpdateClanName = useCallback((clanId: string, newName: string) => {
        if (!user || user.clanId !== clanId) return;
        const clan = allClans.find(c => c.id === clanId);
        if (!clan || clan.leader !== user.name) return;
        const updatedClan = { ...clan, name: newName };
        setAllClans(prev => prev.map(c => c.id === clanId ? updatedClan : c));
    }, [user, allClans]);
    
    const handleUpdateClanBanner = useCallback((clanId: string, banner: string) => {
        if (!user || user.clanId !== clanId) return;
        const clan = allClans.find(c => c.id === clanId);
        if (!clan || clan.leader !== user.name) return;
        const updatedClan = { ...clan, banner };
        setAllClans(prev => prev.map(c => c.id === clanId ? updatedClan : c));
    }, [user, allClans]);
    
    const handleStartClanChat = useCallback((clanToChat: Clan) => {
        if(!user) return;
        updateUser({...user, lastReadClanTimestamp: Date.now()}, false);
        setChattingInClan(clanToChat);
        setChattingWith(null);
    }, [user, updateUser]);

    const handleSendClanMessage = useCallback((clanId: string, text: string) => {
        if (!user) return;
        const newMessage: ClanChatMessage = {
            id: Date.now().toString() + Math.random(), clanId: clanId, from: user.name, fromPic: user.profilePic, text, timestamp: Date.now()
        };
        setClanMessages(prev => [...prev, newMessage]);
    }, [user]);

    const hasUnreadClanMessages = useMemo(() => {
        if (!user || !user.clanId) return false;
        const lastRead = user.lastReadClanTimestamp || 0;
        return clanMessages.some(m => m.clanId === user.clanId && m.timestamp > lastRead && m.from !== user.name);
    }, [user, clanMessages]);
    
    if (!user) {
        return authScreen === 'login'
            ? <LoginPage onLogin={handleLogin} switchToSignup={() => setAuthScreen('signup')} />
            : <SignupPage onSignup={handleSignup} switchToLogin={() => setAuthScreen('login')} />;
    }

    if (viewingProfile) {
        return <ProfilePage 
            userToView={viewingProfile} currentUser={user} allUsers={allUsers} allClans={allClans}
            onBack={() => setViewingProfile(null)} onViewProfile={handleViewProfile} onStartChat={handleStartChat} onSendRequest={handleSendRequest}
            onInviteToClan={handleInviteToClan}
        />;
    }

    if (chattingWith) {
        return <ChatView
            currentUser={user} friend={chattingWith}
            messages={messages.filter(m => (m.from === user.name && m.to === chattingWith!.name) || (m.from === chattingWith!.name && m.to === user.name))}
            onSendMessage={handleSendMessage} onBack={() => setChattingWith(null)} onMarkMessagesAsRead={handleMarkMessagesAsRead}
        />
    }

    if (chattingInClan) {
        return <ClanChatView
            currentUser={user} clan={chattingInClan} allUsers={allUsers} messages={clanMessages.filter(m => m.clanId === chattingInClan.id)}
            onSendMessage={handleSendClanMessage} onBack={() => setChattingInClan(null)} onViewProfile={handleViewProfile}
        />
    }
    
    const hasNotifications = unreadSenders.size > 0 || (user.friendRequests || []).length > 0 || (user.clanInvites || []).length > 0 || hasUnreadClanMessages;

    const renderContent = () => {
        switch (activeTab) {
            case Tab.Home: return <HomePage user={user} onLogHours={handleLogHours} onLogout={handleLogout} onViewProfile={() => handleViewProfile()} />;
            case Tab.Friends: return <FriendsPage 
                currentUser={user} allUsers={allUsers} allClans={allClans} unreadClanMessages={hasUnreadClanMessages}
                onSendRequest={handleSendRequest} onRespondRequest={handleRespondRequest} onViewProfile={handleViewProfile} 
                onStartChat={handleStartChat} unreadSenders={unreadSenders} onCreateClan={handleCreateClan} onInviteToClan={(username) => handleInviteToClan(username)}
                onRespondToClanInvite={handleRespondToClanInvite} onLeaveClan={handleLeaveClan} onKickFromClan={handleKickFromClan}
                onUpdateClanName={handleUpdateClanName} onUpdateClanBanner={handleUpdateClanBanner} onStartClanChat={handleStartClanChat}
                />;
            case Tab.Challenges: return <ChallengesPage currentUser={user} />;
            case Tab.AIAssistant: return <AIAssistantPage 
                plannerMessages={plannerMessages} coachMessages={coachMessages} answerBotMessages={answerBotMessages} helperBotMessages={helperBotMessages}
                onSendPlannerMessage={(prompt) => handleSendAIGeneric(prompt, plannerFile, plannerMessages, setPlannerMessages, "You are a helpful study planner...")}
                onSendCoachMessage={(prompt) => handleSendAIGeneric(prompt, coachFile, coachMessages, setCoachMessages, `You are a study coach. Your personality is ${coachMood}.`)}
                onSendAnswerBotMessage={(prompt) => handleSendAIGeneric(prompt, answerBotFile, answerBotMessages, setAnswerBotMessages, 'You are an answer bot...')}
                onSendHelperBotMessage={(prompt) => handleSendAIGeneric(prompt, helperBotFile, helperBotMessages, setHelperBotMessages, 'You are a helper bot...')}
                onResetPlannerChat={() => {setPlannerMessages([]); setPlannerFile(null);}} onResetCoachChat={() => {setCoachMessages([]); setCoachFile(null);}}
                onResetAnswerBotChat={() => {setAnswerBotMessages([]); setAnswerBotFile(null);}} onResetHelperBotChat={() => {setHelperBotMessages([]); setHelperBotFile(null);}}
                isLoading={isAiLoading} currentUser={user} onPlannerFileUpload={setPlannerFile} onCoachFileUpload={setCoachFile}
                onAnswerBotFileUpload={setAnswerBotFile} onHelperBotFileUpload={setHelperBotFile} plannerFile={plannerFile}
                coachFile={coachFile} answerBotFile={answerBotFile} helperBotFile={helperBotFile} onRemovePlannerFile={() => setPlannerFile(null)}
                onRemoveCoachFile={() => setCoachFile(null)} onRemoveAnswerBotFile={() => setAnswerBotFile(null)} onRemoveHelperBotFile={() => setHelperBotFile(null)}
                coachMood={coachMood} onSetCoachMood={handleSetCoachMood}
            />;
            case Tab.Leaderboards: return <LeaderboardsPage currentUser={user} allUsers={allUsers} allClans={allClans} onViewProfile={handleViewProfile} />;
            case Tab.Shop: return <ShopPage currentUser={user} onPurchase={handlePurchase} onUse={handleUseItem} />;
            case Tab.Settings: return <SettingsPage 
                currentUser={user} onUpdateProfilePic={handleUpdateProfilePic} onUpdateTimezone={handleUpdateTimezone}
                onUpdateTheme={handleUpdateTheme} onUpdateStatus={handleUpdateStatus} onUpdatePrivacy={handleUpdatePrivacy}
                onEquipTitle={handleEquipTitle} onEquipFrame={handleEquipFrame} onUpdateName={handleUpdateName}
                onUpdatePassword={handleUpdatePassword} onViewProfile={() => handleViewProfile()} onUpdateHat={handleUpdateHat}
                onEquipPet={handleEquipPet} onUpdateCustomPet={handleUpdateCustomPet} onUpdateProfileTheme={handleUpdateProfileTheme}
                onEquipFont={handleEquipFont} onUpdateUsernameColor={handleUpdateUsernameColor}
            />;
            case Tab.Admin: return user.isAdmin ? <AdminPage allUsers={allUsers} allClans={allClans} currentUser={user} onDeleteUser={handleDeleteUser} onResetUser={handleResetUser} onUpdateUserStats={handleUpdateUserStats} onDeleteClan={handleDeleteClan} /> : null;
            default: return <HomePage user={user} onLogHours={handleLogHours} onLogout={handleLogout} onViewProfile={() => handleViewProfile()} />;
        }
    };
    
    return (
        <div className="h-full flex flex-col md:flex-row" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
            <SideNav activeTab={activeTab} setActiveTab={setActiveTab} currentUser={user} hasNotifications={hasNotifications} onLogout={handleLogout} onViewProfile={() => handleViewProfile()} />
            <main className="flex-1 overflow-y-auto md:h-full">
                {renderContent()}
            </main>
            <div className="md:hidden">
                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} currentUser={user} hasNotifications={hasNotifications} />
            </div>
            {notification && (
                <NotificationModal 
                    title={notification.title} 
                    message={notification.message} 
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default App;