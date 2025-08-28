

import React, { useState, useCallback, useEffect } from 'react';
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
import GoalsPage from './components/goals/GoalsPage';
import AchievementsPage from './components/achievements/AchievementsPage';
import AdminPage from './components/admin/AdminPage';
import ShopPage from './components/shop/ShopPage';
import NotificationModal from './components/common/NotificationModal';
import { Tab } from './constants';
import { User, ChatMessage, AIMessage, Theme, CoachMood, WeeklyGoal, WeeklyGoals } from './types';
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
    const [notificationCount, setNotificationCount] = useState(0);
    const [notification, setNotification] = useState<{title: string, message: string} | null>(null);


    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });


    useEffect(() => {
        // One-time setup on app load
        let users: User[];
        let initialSaveNeeded = false;
        const storedUsersJSON = localStorage.getItem('focusFlowUsers');

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

        const yesterdayForTimezone = (tz?: string): string => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            try {
                return new Date(yesterday.toLocaleString('en-US', { timeZone: tz || 'UTC' })).toLocaleDateString('en-CA');
            } catch {
                return new Date(yesterday.toISOString().split('T')[0]).toLocaleDateString('en-CA');
            }
        };

        let logicMadeChanges = false;
        const usersWithLogicApplied = users.map(u => {
            let updatedUser = { ...u };
            let userChanged = false;

            // --- Migration for Shop System & Cosmetics ---
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
                const yesterday = yesterdayForTimezone(updatedUser.timezone);
                if (updatedUser.lastStudiedDate !== today && updatedUser.lastStudiedDate !== yesterday) {
                     // Check for Streak Shield before breaking streak
                    if (updatedUser.inventory?.streakShield && updatedUser.inventory.streakShield > 0) {
                        updatedUser.inventory.streakShield -= 1;
                        updatedUser.lastStudiedDate = yesterday; // This simulates having studied yesterday, saving the streak.
                        if (u.name === user?.name) { // Only notify the current user
                           setNotification({ title: "Streak Saved!", message: `Your Streak Shield was automatically used to save your ${u.streak}-day streak. You can buy another one in the shop.` });
                        }
                    } else {
                        console.log(`Streak broken for ${updatedUser.name}. Resetting from ${updatedUser.streak} to 0.`);
                        updatedUser.streak = 0;
                    }
                    userChanged = true;
                }
            }

            // Migration for createdAt & prestige
            if (typeof updatedUser.createdAt === 'undefined') {
                const earliestLog = updatedUser.studyLog?.length > 0
                    ? [...updatedUser.studyLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
                    : null;
                updatedUser.createdAt = earliestLog ? new Date(earliestLog.date).getTime() : Date.now();
                console.log(`Migrated createdAt for ${updatedUser.name}.`);
                userChanged = true;
            }
             if (typeof updatedUser.prestige === 'undefined') {
                updatedUser.prestige = 0;
                userChanged = true;
            }

            if (userChanged) {
                logicMadeChanges = true;
            }
            return updatedUser;
        });


        if (initialSaveNeeded || logicMadeChanges) {
            const usersToSave = usersWithLogicApplied.map(u => ({ ...u, hash: generateDataHash(u) }));
            localStorage.setItem('focusFlowUsers', JSON.stringify(usersToSave));
            users = usersToSave;
        } else {
            users = usersWithLogicApplied;
        }

        const verifiedUsers = users.filter(u => {
            const isVerified = verifyDataHash(u);
            if (!isVerified) {
                console.warn(`Data integrity check failed for user ${u.name}. Their data may be corrupt or tampered with.`);
            }
            return isVerified;
        });

        setAllUsers(verifiedUsers);
        
        // Restore session
        try {
            const loggedInUserJSON = sessionStorage.getItem('focusFlowLoggedInUser');
            if (loggedInUserJSON) {
                const loggedInUser = JSON.parse(loggedInUserJSON);
                const fullUserFromStorage = verifiedUsers.find(u => u.name === loggedInUser.name);
                if (fullUserFromStorage) {
                    const { password, ...userToSet } = fullUserFromStorage;
                    setUser(userToSet);

                    // Calculate unread messages for the logged-in user
                    const storedMessagesJSON = localStorage.getItem('focusFlowMessages');
                    if (storedMessagesJSON) {
                        const storedMessages: ChatMessage[] = JSON.parse(storedMessagesJSON);
                        const unread = new Set<string>();
                        storedMessages.forEach(msg => {
                            if (msg.to === loggedInUser.name && !msg.read) {
                                unread.add(msg.from);
                            }
                        });
                        setUnreadSenders(unread);
                        setMessages(storedMessages);
                    }

                    // Load AI chats
                    const storedPlannerMessages = localStorage.getItem('focusFlowPlannerMessages');
                    if (storedPlannerMessages) setPlannerMessages(JSON.parse(storedPlannerMessages));
                    
                    const storedCoachMessages = localStorage.getItem('focusFlowCoachMessages');
                    if (storedCoachMessages) setCoachMessages(JSON.parse(storedCoachMessages));
                    
                    const storedAnswerBotMessages = localStorage.getItem('focusFlowAnswerBotMessages');
                    if (storedAnswerBotMessages) setAnswerBotMessages(JSON.parse(storedAnswerBotMessages));
                    
                    const storedHelperBotMessages = localStorage.getItem('focusFlowHelperBotMessages');
                    if (storedHelperBotMessages) setHelperBotMessages(JSON.parse(storedHelperBotMessages));

                    const storedCoachMood = localStorage.getItem('focusFlowCoachMood');
                    if (storedCoachMood) setCoachMood(storedCoachMood as CoachMood);

                }
            } else {
                // if no logged in user, still load messages for potential login
                const storedMessages = localStorage.getItem('focusFlowMessages');
                if (storedMessages) {
                    setMessages(JSON.parse(storedMessages));
                }
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
        if (selectedTheme.font) {
            root.style.setProperty('--font-family-main', selectedTheme.font);
        } else {
            root.style.removeProperty('--font-family-main');
        }
    }, [user?.theme]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('focusFlowPlannerMessages', JSON.stringify(plannerMessages));
        }
    }, [plannerMessages, user]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('focusFlowCoachMessages', JSON.stringify(coachMessages));
        }
    }, [coachMessages, user]);

     useEffect(() => {
        if (user) {
            localStorage.setItem('focusFlowAnswerBotMessages', JSON.stringify(answerBotMessages));
        }
    }, [answerBotMessages, user]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('focusFlowHelperBotMessages', JSON.stringify(helperBotMessages));
        }
    }, [helperBotMessages, user]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('focusFlowCoachMood', coachMood);
        }
    }, [coachMood, user]);

    const updateUser = useCallback((updatedUser: User | null, updateAllUsers: boolean = true) => {
        setUser(updatedUser);
        if (updatedUser && updateAllUsers) {
            setAllUsers(prevUsers => {
                const userExists = prevUsers.some(u => u.name === updatedUser.name);
                const newUsers = userExists
                    ? prevUsers.map(u => (u.name === updatedUser.name ? updatedUser : u))
                    : [...prevUsers, updatedUser];
                
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
            setPlannerMessages([]);
            setCoachMessages([]);
            setAnswerBotMessages([]);
            setHelperBotMessages([]);
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
                if (!isValidUsername(trimmedName)) {
                    resolve("Name must be 1-20 characters and contain only letters, numbers, and spaces.");
                    return;
                }
                const existingUser = allUsers.find(u => u.name.toLowerCase() === trimmedName.toLowerCase());
                if (existingUser) {
                    resolve("This username is already taken. Please choose another one.");
                } else {
                    const newUser: User = {
                        name: trimmedName,
                        password,
                        profilePic: PREDEFINED_AVATARS[Math.floor(Math.random() * 5)],
                        level: 1,
                        xp: 0,
                        streak: 0,
                        lastStudiedDate: null,
                        studyLog: [],
                        friends: [],
                        friendRequests: [],
                        theme: 'blue',
                        status: 'Ready to start my journey!',
                        weeklyGoals: {
                            weekIdentifier: getWeekIdentifier(new Date(), 'UTC'),
                            goals: generateNewWeeklyGoals(),
                        },
                        totalGoalsCompleted: 0,
                        achievements: [],
                        createdAt: Date.now(),
                        prestige: 0,
                        coins: 0,
                        inventory: { streakShield: 0 },
                        unlocks: [ 'theme-blue', 'theme-emerald', 'theme-rose', 'theme-violet', 'theme-amber', 'avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5' ],
                    };
                    updateUser(newUser, true);
                    resolve(null);
                }
           }, 500);
       });
    }, [allUsers, updateUser]);

    const handleLogout = () => {
        updateUser(null);
        setActiveTab(Tab.Home);
        setAuthScreen('login');
    };

    const handleLogHours = useCallback((hours: number) => {
        if (!user) return;
        const today = getLocalDateString(user.timezone);
        
        const prestigeInfo = getPrestigeConfig(user.prestige);
        const xpGained = Math.round(hours * 100 * prestigeInfo.multiplier);
        const coinsGained = Math.round(hours * 100 * prestigeInfo.multiplier); // 1 coin per XP

        const newStudyLog = [...user.studyLog, { date: today, hours }];
        let newXp = user.xp + xpGained;
        let newLevel = user.level;
        let newPrestige = user.prestige || 0;
        
        // --- Level Up Logic ---
        let neededForNext = xpForLevelUp(newLevel);
        while (newXp - totalXpToReachLevel(newLevel) >= neededForNext) {
            newLevel++;
            neededForNext = xpForLevelUp(newLevel);
            setNotification({ title: "Level Up!", message: `Congratulations! You've reached Level ${newLevel}. Your new title is "${determineTitle(newLevel, newPrestige)}".` });
        }

        // --- Prestige Logic ---
        const prestigeCap = getPrestigeConfig(newPrestige).cap;
        if (newLevel >= prestigeCap) {
             setNotification({
                title: "Prestige Available!",
                message: `You've hit the level cap! You can now Prestige in the Shop to unlock a permanent XP & Coin boost, a new badge, and reset your level to 1 to climb again.`
            });
        }
        
        // --- Streak Logic ---
        let newStreak = user.streak;
        if (user.lastStudiedDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = getLocalDateString(user.timezone);
            if (user.lastStudiedDate === yesterdayStr) {
                newStreak++;
            } else {
                newStreak = 1;
            }
        }
        
        let updatedUser: User = {
            ...user,
            xp: newXp,
            level: newLevel,
            streak: newStreak,
            lastStudiedDate: today,
            studyLog: newStudyLog,
            coins: (user.coins || 0) + coinsGained,
        };
        
        // --- Goal Checking Logic ---
        if (updatedUser.weeklyGoals && updatedUser.weeklyGoals.goals) {
            const currentWeekIdentifier = getWeekIdentifier(new Date(), updatedUser.timezone);
            if (updatedUser.weeklyGoals.weekIdentifier !== currentWeekIdentifier) {
                updatedUser.weeklyGoals = {
                    weekIdentifier: currentWeekIdentifier,
                    goals: generateNewWeeklyGoals()
                };
            } else {
                let goalsCompletedThisLog = 0;
                const newGoals = updatedUser.weeklyGoals.goals.map(goal => {
                    if (goal.completed) return goal;

                    let isCompleted = false;
                    switch(goal.type) {
                        case 'log_hours_session':
                            if (hours >= goal.target) isCompleted = true;
                            break;
                        case 'reach_streak':
                            if (newStreak >= goal.target) isCompleted = true;
                            break;
                        case 'log_hours_weekly':
                            const hoursThisWeek = updatedUser.studyLog
                                .filter(log => new Date(log.date) >= new Date(updatedUser.weeklyGoals!.weekIdentifier))
                                .reduce((sum, log) => sum + log.hours, 0);
                            if (hoursThisWeek + hours >= goal.target) isCompleted = true;
                            break;
                    }

                    if (isCompleted) {
                        goalsCompletedThisLog++;
                        return { ...goal, completed: true };
                    }
                    return goal;
                });
                
                if (goalsCompletedThisLog > 0) {
                    updatedUser.xp += goalsCompletedThisLog * 50;
                    updatedUser.totalGoalsCompleted = (updatedUser.totalGoalsCompleted || 0) + goalsCompletedThisLog;
                    updatedUser.weeklyGoals.goals = newGoals;
                    setNotification({ title: "Goal Complete!", message: `You've completed ${goalsCompletedThisLog} weekly goal${goalsCompletedThisLog > 1 ? 's' : ''} and earned ${goalsCompletedThisLog * 50} bonus XP!` });
                }
            }
        }
        
        // --- Achievement Checking Logic ---
        const unlockedAchievements = new Set((updatedUser.achievements || []).map(a => a.id));
        const newlyUnlocked = ACHIEVEMENTS_LIST.filter(ach => 
            !unlockedAchievements.has(ach.id) && ach.check(updatedUser)
        );

        if (newlyUnlocked.length > 0) {
            const newAchievements = newlyUnlocked.map(ach => ({ id: ach.id, unlockedAt: Date.now() }));
            updatedUser.achievements = [...(updatedUser.achievements || []), ...newAchievements];
            const firstNew = newlyUnlocked[0];
            setNotification({
                title: "Achievement Unlocked!",
                message: `${firstNew.name} - You've earned the title "${firstNew.reward.title}". You can equip it in Settings.`
            });
        }
        
        // Set new title if not custom equipped
        if (!updatedUser.equippedTitle) {
            updatedUser.title = determineTitle(newLevel, newPrestige);
        }
        
        updateUser(updatedUser);
    }, [user, updateUser]);

    const handleUpdateProfilePic = useCallback((newPic: string) => {
        if (!user) return;
        updateUser({ ...user, profilePic: newPic });
    }, [user, updateUser]);

    const handleUpdateTimezone = useCallback((newTimezone: string) => {
        if (!user) return;
        updateUser({ ...user, timezone: newTimezone });
    }, [user, updateUser]);
    
    const handleUpdateTheme = useCallback((newThemeId: string) => {
        if (!user) return;
        updateUser({ ...user, theme: newThemeId });
    }, [user, updateUser]);

    const handleUpdateStatus = useCallback((newStatus: string) => {
        if (!user) return;
        const sanitizedStatus = sanitizeInput(newStatus);
        updateUser({ ...user, status: sanitizedStatus });
    }, [user, updateUser]);

    const handleUpdatePrivacy = useCallback((isPrivate: boolean) => {
        if (!user) return;
        updateUser({ ...user, isPrivate });
    }, [user, updateUser]);

    const handleEquipTitle = useCallback((title: string | null) => {
        if (!user) return;
        updateUser({ ...user, equippedTitle: title || undefined });
    }, [user, updateUser]);
    
    const handleEquipFrame = useCallback((frameId: string | null) => {
        if (!user) return;
        updateUser({ ...user, equippedFrame: frameId || undefined });
    }, [user, updateUser]);
    
    const handleUpdateHat = useCallback((newHat: string | null) => {
        if (!user) return;
        updateUser({ ...user, equippedHat: newHat || undefined });
    }, [user, updateUser]);

    const handleEquipPet = useCallback((petId: string | null) => {
        if (!user) return;
        updateUser({ ...user, equippedPet: petId || undefined });
    }, [user, updateUser]);

    const handleUpdateCustomPet = useCallback((petUrl: string | null) => {
        if (!user) return;
        updateUser({ ...user, customPetUrl: petUrl || undefined, equippedPet: petUrl ? 'custom' : user.equippedPet === 'custom' ? undefined : user.equippedPet });
    }, [user, updateUser]);
    
    const handleUpdateProfileTheme = useCallback((bg: string) => {
        if (!user) return;
        updateUser({ ...user, profileTheme: { bg } });
    }, [user, updateUser]);

    const handleEquipFont = useCallback((fontId: string | null) => {
        if (!user) return;
        updateUser({ ...user, equippedFont: fontId || undefined });
    }, [user, updateUser]);

    const handleUpdateUsernameColor = useCallback((color: string | null) => {
        if (!user) return;
        updateUser({ ...user, usernameColor: color || undefined });
    }, [user, updateUser]);

    const handleUpdateName = useCallback(async (newName: string): Promise<string | null> => {
        if (!user) return "Not logged in.";
        const trimmedName = newName.trim();
        if (trimmedName === user.name) return null; // No change
        if (!isValidUsername(trimmedName)) return "Invalid name format.";
        const isTaken = allUsers.some(u => u.name.toLowerCase() === trimmedName.toLowerCase());
        if (isTaken) return "Name already taken.";

        // This is complex because we need to update the name everywhere
        const oldName = user.name;
        
        // Update current user's name
        const updatedUser = { ...user, name: trimmedName };

        // Update name in all other users' friends lists and friend requests
        const updatedAllUsers = allUsers.map(u => {
            if (u.name === oldName) return updatedUser;

            const newFriends = u.friends?.map(f => f === oldName ? trimmedName : f);
            const newRequests = u.friendRequests?.map(r => r.from === oldName ? { ...r, from: trimmedName } : r);
            
            return {
                ...u,
                friends: newFriends,
                friendRequests: newRequests
            };
        });

        // Update messages
        const updatedMessages = messages.map(msg => {
            let newMsg = { ...msg };
            if (msg.from === oldName) newMsg.from = trimmedName;
            if (msg.to === oldName) newMsg.to = trimmedName;
            return newMsg;
        });
        setMessages(updatedMessages);
        localStorage.setItem('focusFlowMessages', JSON.stringify(updatedMessages));
        
        updateUser(updatedUser, false); // Update current user session without saving all users yet
        setAllUsers(() => {
            const usersToSave = updatedAllUsers.map(u => ({ ...u, hash: generateDataHash(u) }));
            localStorage.setItem('focusFlowUsers', JSON.stringify(usersToSave));
            return updatedAllUsers;
        });

        return null; // Success
    }, [user, allUsers, messages, updateUser]);

    const handleUpdatePassword = useCallback(async (oldPass: string, newPass: string): Promise<string | null> => {
        if (!user) return "Not logged in.";
        const fullUser = allUsers.find(u => u.name === user.name);
        if (fullUser?.password !== oldPass) {
            return "Incorrect current password.";
        }
        updateUser({ ...user, password: newPass });
        return null;
    }, [user, allUsers, updateUser]);
    
    const handleSendRequest = useCallback((toUsername: string) => {
        if (!user) return;
        const recipient = allUsers.find(u => u.name === toUsername);
        if (!recipient) return;

        // Check if a request already exists
        if (recipient.friendRequests.some(req => req.from === user.name)) return;

        const newRecipient = {
            ...recipient,
            friendRequests: [...recipient.friendRequests, { from: user.name, status: 'pending' as const }]
        };
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

        const updatedCurrentUser = {
            ...user,
            friendRequests: user.friendRequests.filter(req => req.from !== fromUsername)
        };
        let updatedSender = { ...sender };
        
        if (accept) {
            updatedCurrentUser.friends = [...new Set([...user.friends, fromUsername])];
            updatedSender.friends = [...new Set([...sender.friends, user.name])];
        }

        setAllUsers(prev => {
            const newUsers = prev.map(u => {
                if (u.name === user.name) return updatedCurrentUser;
                if (u.name === fromUsername) return updatedSender;
                return u;
            });
            localStorage.setItem('focusFlowUsers', JSON.stringify(newUsers.map(u => ({...u, hash: generateDataHash(u)}))));
            return newUsers;
        });
        updateUser(updatedCurrentUser, false);
    }, [user, allUsers, updateUser]);
    
    const handleStartChat = useCallback((userToChat: User) => {
        setChattingWith(userToChat);
    }, []);

    const handleSendMessage = useCallback((to: string, text: string, type: 'text' | 'image', imageDataUrl?: string) => {
        if (!user) return;
        const newMessage: ChatMessage = {
            id: Date.now().toString() + Math.random(),
            from: user.name,
            to,
            text,
            timestamp: Date.now(),
            type,
            imageDataUrl,
            read: false,
        };
        setMessages(prev => {
            const newMessages = [...prev, newMessage];
            localStorage.setItem('focusFlowMessages', JSON.stringify(newMessages));
            return newMessages;
        });
    }, [user]);

    const handleMarkMessagesAsRead = useCallback((partnerName: string) => {
         if (!user) return;
        let changed = false;
        const newMessages = messages.map(msg => {
            if (msg.from === partnerName && msg.to === user.name && !msg.read) {
                changed = true;
                return { ...msg, read: true };
            }
            return msg;
        });

        if (changed) {
            setMessages(newMessages);
            localStorage.setItem('focusFlowMessages', JSON.stringify(newMessages));
            setUnreadSenders(prev => {
                const newUnread = new Set(prev);
                newUnread.delete(partnerName);
                return newUnread;
            });
        }
    }, [user, messages]);
    
    const handleViewProfile = (username?: string) => {
        const userToView = allUsers.find(u => u.name === (username || user?.name));
        if (userToView) {
            setViewingProfile(userToView);
        }
    };

    // Admin handlers
    const handleDeleteUser = useCallback((username: string) => {
        setAllUsers(prev => {
            const newUsers = prev.filter(u => u.name !== username);
            const usersToSave = newUsers.map(u => ({ ...u, hash: generateDataHash(u) }));
            localStorage.setItem('focusFlowUsers', JSON.stringify(usersToSave));
            return newUsers;
        });
    }, []);

    const handleResetUser = useCallback((username: string) => {
        setAllUsers(prev => {
            const newUsers = prev.map(u => {
                if (u.name === username) {
                    return {
                        ...u,
                        level: 1,
                        xp: 0,
                        streak: 0,
                        lastStudiedDate: null,
                        studyLog: [],
                        achievements: [],
                        totalGoalsCompleted: 0,
                        weeklyGoals: {
                            weekIdentifier: getWeekIdentifier(new Date(), u.timezone || 'UTC'),
                            goals: generateNewWeeklyGoals()
                        },
                    }
                }
                return u;
            });
            const usersToSave = newUsers.map(u => ({ ...u, hash: generateDataHash(u as User) }));
            localStorage.setItem('focusFlowUsers', JSON.stringify(usersToSave));
            return newUsers;
        });
    }, []);

    const handleUpdateUserStats = useCallback((username: string, newStats: any) => {
        setAllUsers(prev => {
            const newUsers = prev.map(u => {
                if (u.name === username) {
                    let mutableUser = { ...u, ...newStats };

                    let currentLevel = mutableUser.level;
                    let currentPrestige = mutableUser.prestige || 0;
                    
                    let cap = getPrestigeConfig(currentPrestige).cap;
                    while (currentLevel >= cap) {
                        currentLevel = (currentLevel - cap) + 1;
                        currentPrestige++;
                        cap = getPrestigeConfig(currentPrestige).cap;
                    }

                    mutableUser.level = currentLevel;
                    mutableUser.prestige = currentPrestige;
                    mutableUser.xp = totalXpToReachLevel(currentLevel);

                    if (!mutableUser.equippedTitle) {
                        mutableUser.title = determineTitle(mutableUser.level, mutableUser.prestige);
                    } else {
                         mutableUser.title = determineTitle(mutableUser.level, mutableUser.prestige);
                    }

                    return mutableUser;
                }
                return u;
            });
            const usersToSave = newUsers.map(u => ({ ...u, hash: generateDataHash(u) }));
            localStorage.setItem('focusFlowUsers', JSON.stringify(usersToSave));
            
            if (user && user.name === username) {
                const updatedCurrentUser = newUsers.find(u => u.name === username);
                if (updatedCurrentUser) {
                    const { password, ...userToSet } = updatedCurrentUser;
                    setUser(userToSet);
                }
            }
            return newUsers;
        });
    }, [user]);

    // Shop handlers
    const handlePurchase = useCallback((itemId: string) => {
        if (!user) return;

        const item = SHOP_ITEMS.find(i => i.id === itemId);
        if (!item) return;

        if ((user.coins || 0) < item.price) {
            alert("Not enough coins!");
            return;
        }

        let updatedUser = { ...user };
        updatedUser.coins = (updatedUser.coins || 0) - item.price;
        
        if (item.type === 'consumable') {
            updatedUser.inventory = updatedUser.inventory || {};
            if (item.id === 'consumable-streak-shield') {
                if ((updatedUser.inventory.streakShield || 0) >= 1) {
                    alert("You can only hold one Streak Shield at a time.");
                    return; // Refund
                }
                updatedUser.inventory.streakShield = 1;
            } else if (item.id.startsWith('consumable-xp-potion')) {
                updatedUser.inventory.xpPotions = updatedUser.inventory.xpPotions || {};
                updatedUser.inventory.xpPotions[item.id] = (updatedUser.inventory.xpPotions[item.id] || 0) + 1;
            }
        } else if (item.id.startsWith('username-color-pack')) {
             const pack = COLOR_PACKS[item.id];
             if (pack) {
                 const colorUnlocks = pack.colors.map(colorId => `color-${colorId}`);
                 updatedUser.unlocks = [...new Set([...(updatedUser.unlocks || []), ...colorUnlocks, item.id])];
             }
        } else {
             updatedUser.unlocks = [...new Set([...(updatedUser.unlocks || []), item.id])];
        }
        
        updateUser(updatedUser);
        setNotification({ title: "Purchase Successful!", message: `You bought ${item.name} for ${item.price} coins.`});

    }, [user, updateUser]);

    const handleUseItem = useCallback((itemId: string) => {
        if (!user) return;
        
        if (itemId.startsWith('consumable-xp-potion-')) {
            const xpAmount = parseInt(itemId.split('-').pop() || '0');
            if (xpAmount > 0) {
                const updatedUser = { ...user };
                const currentPotions = updatedUser.inventory?.xpPotions?.[itemId] || 0;
                if (currentPotions > 0) {
                    updatedUser.inventory!.xpPotions![itemId] -= 1;
                    setNotification({ title: "XP Gained!", message: `You used an XP Potion and gained ${xpAmount} XP!` });
                    
                    let newXp = updatedUser.xp + xpAmount;
                    let newLevel = updatedUser.level;
                    let newPrestige = updatedUser.prestige || 0;
                    
                    let neededForNext = xpForLevelUp(newLevel);
                    while (newXp - totalXpToReachLevel(newLevel) >= neededForNext) {
                        newLevel++;
                        neededForNext = xpForLevelUp(newLevel);
                         setNotification({ title: "Level Up!", message: `Congratulations! You've reached Level ${newLevel}. Your new title is "${determineTitle(newLevel, newPrestige)}".` });
                    }
                    
                    updatedUser.xp = newXp;
                    updatedUser.level = newLevel;

                    if (!updatedUser.equippedTitle) {
                        updatedUser.title = determineTitle(newLevel, newPrestige);
                    }
                    
                    updateUser(updatedUser);
                }
            }
        }
    }, [user, updateUser]);

    // AI handlers
    const handleSetCoachMood = (mood: CoachMood) => {
        if (mood !== coachMood) {
            setCoachMessages([]); // Reset chat history on mood change
        }
        setCoachMood(mood);
    };

    const handleSendAIGeneric = async (
        prompt: string,
        file: UploadedFile | null,
        currentMessages: AIMessage[],
        setMessages: React.Dispatch<React.SetStateAction<AIMessage[]>>,
        systemInstruction: string = ''
    ) => {
        if (!prompt && !file) return;

        setIsAiLoading(true);
        const userMessage: AIMessage = { id: Date.now().toString(), role: 'user', text: prompt, timestamp: Date.now() };
        const newMessages = [...currentMessages, userMessage];
        setMessages(newMessages);

        try {
            const contents: Content[] = [{
                role: 'user',
                parts: []
            }];

            if (file) {
                contents[0].parts.push({ inlineData: { mimeType: file.type, data: file.data } });
            }
            if (prompt) {
                contents[0].parts.push({ text: prompt });
            }

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contents,
                ...(systemInstruction && { config: { systemInstruction } })
            });

            const modelMessage: AIMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: response.text,
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("AI Error:", error);
            const errorMessage: AIMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "Sorry, I encountered an error. Please try again.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAiLoading(false);
        }
    };
    
    if (!user) {
        return authScreen === 'login'
            ? <LoginPage onLogin={handleLogin} switchToSignup={() => setAuthScreen('signup')} />
            : <SignupPage onSignup={handleSignup} switchToLogin={() => setAuthScreen('login')} />;
    }

    if (viewingProfile) {
        return <ProfilePage 
            userToView={viewingProfile} 
            currentUser={user}
            allUsers={allUsers}
            onBack={() => setViewingProfile(null)}
            onViewProfile={handleViewProfile}
            onStartChat={handleStartChat}
            onSendRequest={handleSendRequest}
        />;
    }

    if (chattingWith) {
        return <ChatView
            currentUser={user}
            friend={chattingWith}
            messages={messages.filter(m => (m.from === user.name && m.to === chattingWith!.name) || (m.from === chattingWith!.name && m.to === user.name))}
            onSendMessage={handleSendMessage}
            onBack={() => setChattingWith(null)}
            onMarkMessagesAsRead={handleMarkMessagesAsRead}
        />
    }

    const renderContent = () => {
        switch (activeTab) {
            case Tab.Home: return <HomePage user={user} onLogHours={handleLogHours} onLogout={handleLogout} onViewProfile={() => handleViewProfile()} />;
            case Tab.Friends: return <FriendsPage currentUser={user} allUsers={allUsers} onSendRequest={handleSendRequest} onRespondRequest={handleRespondRequest} onViewProfile={handleViewProfile} onStartChat={handleStartChat} unreadSenders={unreadSenders} />;
            case Tab.Goals: return <GoalsPage user={user} />;
            case Tab.Achievements: return <AchievementsPage currentUser={user} />;
            case Tab.AIAssistant: return <AIAssistantPage 
                plannerMessages={plannerMessages}
                coachMessages={coachMessages}
                answerBotMessages={answerBotMessages}
                helperBotMessages={helperBotMessages}
                onSendPlannerMessage={(prompt) => handleSendAIGeneric(prompt, plannerFile, plannerMessages, setPlannerMessages, "You are a helpful study planner. Create a detailed study plan based on the user's request.")}
                onSendCoachMessage={(prompt) => handleSendAIGeneric(prompt, coachFile, coachMessages, setCoachMessages, `You are a study coach. Your personality is ${coachMood}.`)}
                onSendAnswerBotMessage={(prompt) => handleSendAIGeneric(prompt, answerBotFile, answerBotMessages, setAnswerBotMessages, 'You are an answer bot. Provide concise and accurate answers.')}
                onSendHelperBotMessage={(prompt) => handleSendAIGeneric(prompt, helperBotFile, helperBotMessages, setHelperBotMessages, 'You are a helper bot. Explain concepts clearly and simply.')}
                onResetPlannerChat={() => {setPlannerMessages([]); setPlannerFile(null);}}
                onResetCoachChat={() => {setCoachMessages([]); setCoachFile(null);}}
                onResetAnswerBotChat={() => {setAnswerBotMessages([]); setAnswerBotFile(null);}}
                onResetHelperBotChat={() => {setHelperBotMessages([]); setHelperBotFile(null);}}
                isLoading={isAiLoading}
                currentUser={user}
                onPlannerFileUpload={setPlannerFile}
                onCoachFileUpload={setCoachFile}
                onAnswerBotFileUpload={setAnswerBotFile}
                onHelperBotFileUpload={setHelperBotFile}
                plannerFile={plannerFile}
                coachFile={coachFile}
                answerBotFile={answerBotFile}
                helperBotFile={helperBotFile}
                onRemovePlannerFile={() => setPlannerFile(null)}
                onRemoveCoachFile={() => setCoachFile(null)}
                onRemoveAnswerBotFile={() => setAnswerBotFile(null)}
                onRemoveHelperBotFile={() => setHelperBotFile(null)}
                coachMood={coachMood}
                onSetCoachMood={handleSetCoachMood}
            />;
            case Tab.Leaderboards: return <LeaderboardsPage currentUser={user} allUsers={allUsers} onViewProfile={handleViewProfile} />;
            case Tab.Shop: return <ShopPage currentUser={user} onPurchase={handlePurchase} onUse={handleUseItem} />;
            case Tab.Settings: return <SettingsPage 
                currentUser={user}
                onUpdateProfilePic={handleUpdateProfilePic}
                onUpdateTimezone={handleUpdateTimezone}
                onUpdateTheme={handleUpdateTheme}
                onUpdateStatus={handleUpdateStatus}
                onUpdatePrivacy={handleUpdatePrivacy}
                onEquipTitle={handleEquipTitle}
                onEquipFrame={handleEquipFrame}
                onUpdateName={handleUpdateName}
                onUpdatePassword={handleUpdatePassword}
                onViewProfile={() => handleViewProfile()}
                onUpdateHat={handleUpdateHat}
                onEquipPet={handleEquipPet}
                onUpdateCustomPet={handleUpdateCustomPet}
                onUpdateProfileTheme={handleUpdateProfileTheme}
                onEquipFont={handleEquipFont}
                onUpdateUsernameColor={handleUpdateUsernameColor}
            />;
            case Tab.Admin: return user.isAdmin ? <AdminPage allUsers={allUsers} currentUser={user} onDeleteUser={handleDeleteUser} onResetUser={handleResetUser} onUpdateUserStats={handleUpdateUserStats} /> : null;
            default: return <HomePage user={user} onLogHours={handleLogHours} onLogout={handleLogout} onViewProfile={() => handleViewProfile()} />;
        }
    };
    
    return (
        <div className="h-full flex flex-col md:flex-row" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
            <SideNav activeTab={activeTab} setActiveTab={setActiveTab} currentUser={user} hasNotifications={unreadSenders.size > 0 || (user.friendRequests || []).length > 0} onLogout={handleLogout} onViewProfile={() => handleViewProfile()} />
            <main className="flex-1 overflow-y-auto md:h-full">
                {renderContent()}
            </main>
            <div className="md:hidden">
                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} currentUser={user} hasNotifications={unreadSenders.size > 0 || (user.friendRequests || []).length > 0} />
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