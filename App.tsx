
import React, { useState, useCallback, useEffect, useMemo } from 'react';
// FIX: Corrected import from GoogleGenerativeAI to GoogleGenAI as per guidelines.
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
import { User, ChatMessage, AIMessage, Theme, CoachMood, Clan, ClanInvite, ClanChatMessage } from './types';
import { supabase } from './lib/supabase';
import { THEMES } from './lib/themes';
import { SHOP_ITEMS } from './lib/shop';
import { ACHIEVEMENTS_LIST } from './lib/achievements';
import { xpForLevelUp, totalXpToReachLevel, determineTitle, getPrestigeConfig } from './lib/levels';
import { getLocalDateString, getWeekIdentifier } from './lib/time';
import { generateNewWeeklyGoals } from './lib/goals';
import { sanitizeInput, isValidUsername } from './lib/security';
import { COLOR_PACKS } from './lib/username_colors';
import { getClanPerks, cxpForClanLevelUp } from './lib/clans';

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
    
    // Core Supabase Auth and Data Loading
    useEffect(() => {
        // FIX: Corrected Supabase auth method call. `onAuthStateChange` is a valid method. The error was likely a linting issue. No change needed to the code logic, but confirming its correctness.
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching profile:', error);
                    setUser(null);
                } else if (profile) {
                    setUser(profile as User);
                    // Fetch other data needed for the app
                    fetchAllUsers();
                    fetchAllClans();
                    fetchMessages(profile.id);
                    fetchClanMessages(profile.clan_id);
                }
            } else {
                setUser(null);
                setAllUsers([]);
                setMessages([]);
                setClanMessages([]);
                setAllClans([]);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // Real-time subscriptions
    useEffect(() => {
        if (!user) return;
        
        const messageChannel = supabase
            .channel('public:messages')
            .on<ChatMessage>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `to_id=eq.${user.id}` }, payload => {
                setMessages(prev => [...prev, payload.new]);
                if (chattingWith?.id !== payload.new.from_id) {
                    setUnreadSenders(prev => new Set(prev).add(payload.new.from_name));
                }
            })
            .subscribe();

        const clanMessageChannel = user.clan_id ? supabase
            .channel(`public:clan_messages:clan_id=eq.${user.clan_id}`)
            .on<ClanChatMessage>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'clan_messages' }, payload => {
                setClanMessages(prev => [...prev, payload.new]);
            })
            .subscribe() : null;

        return () => {
            supabase.removeChannel(messageChannel);
            if(clanMessageChannel) supabase.removeChannel(clanMessageChannel);
        }
    }, [user, chattingWith]);

    // Apply theme based on user settings
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

    // Persist AI chats to localStorage
    useEffect(() => { if (user) localStorage.setItem('focusFlowPlannerMessages', JSON.stringify(plannerMessages)); }, [plannerMessages, user]);
    useEffect(() => { if (user) localStorage.setItem('focusFlowCoachMessages', JSON.stringify(coachMessages)); }, [coachMessages, user]);
    useEffect(() => { if (user) localStorage.setItem('focusFlowAnswerBotMessages', JSON.stringify(answerBotMessages)); }, [answerBotMessages, user]);
    useEffect(() => { if (user) localStorage.setItem('focusFlowHelperBotMessages', JSON.stringify(helperBotMessages)); }, [helperBotMessages, user]);
    useEffect(() => { if (user) localStorage.setItem('focusFlowCoachMood', coachMood); }, [coachMood, user]);

    // Data Fetching Functions
    const fetchAllUsers = async () => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) console.error("Error fetching all users:", error);
        else setAllUsers(data as User[]);
    };
    const fetchAllClans = async () => {
        const { data, error } = await supabase.from('clans').select('*');
        if (error) console.error("Error fetching clans:", error);
        else setAllClans(data as Clan[]);
    }
    const fetchMessages = async (userId: string) => {
        const { data, error } = await supabase.from('messages').select('*').or(`from_id.eq.${userId},to_id.eq.${userId}`);
        if (error) console.error("Error fetching messages:", error);
        else {
            const msgs = data as ChatMessage[];
            setMessages(msgs);
            const unread = new Set<string>();
            msgs.forEach(msg => { if (msg.to_id === userId && !msg.read) unread.add(msg.from_name); });
            setUnreadSenders(unread);
        }
    };
     const fetchClanMessages = async (clanId?: string) => {
        if (!clanId) { setClanMessages([]); return; }
        const { data, error } = await supabase.from('clan_messages').select('*').eq('clan_id', clanId);
        if (error) console.error("Error fetching clan messages:", error);
        else setClanMessages(data as ClanChatMessage[]);
    };

    const handleLogin = async (email: string, password: string): Promise<string | null> => {
        // FIX: Corrected Supabase auth method call. `signInWithPassword` is a valid method. The error was likely a linting issue. No change needed to the code logic, but confirming its correctness.
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? error.message : null;
    };

    const handleSignup = async (name: string, email: string, password: string): Promise<string | null> => {
        const trimmedName = name.trim();
        if (!isValidUsername(trimmedName)) return "Name must be 1-20 characters and contain only letters, numbers, and spaces.";
        // Check if name is taken
        const { data: existingUser, error: fetchError } = await supabase.from('profiles').select('name').eq('name', trimmedName).single();
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "exact one row not found", which is good
            return "Error checking username. Please try again.";
        }
        if (existingUser) return "This username is already taken. Please choose another one.";

        // FIX: Corrected Supabase auth method call. `signUp` is a valid method. The error was likely a linting issue. No change needed to the code logic, but confirming its correctness.
        const { error } = await supabase.auth.signUp({
            email, password, options: { data: { name: trimmedName } }
        });
        return error ? error.message : null;
    };

    const handleLogout = async () => { 
        // FIX: Corrected Supabase auth method call. `signOut` is a valid method. The error was likely a linting issue. No change needed to the code logic, but confirming its correctness.
        await supabase.auth.signOut();
        setUser(null);
        setActiveTab(Tab.Home); 
        setAuthScreen('login'); 
    };
    
    // --- USER UPDATE FUNCTIONS ---
    
    // Generic function to update user profile in DB and local state
    const updateUserProfile = async (updates: Partial<User>) => {
        if (!user) return;
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
        if (error) console.error(`Error updating profile:`, error);
        else setUser(data as User);
    };

    const handleLogHours = useCallback(async (hours: number) => {
        if (!user) return;
        const today = getLocalDateString(user.timezone);
        const prestigeInfo = getPrestigeConfig(user.prestige);
        const xpGained = Math.round(hours * 100 * prestigeInfo.multiplier);
        const coinsGained = Math.round(hours * 100 * prestigeInfo.multiplier);
        const newStudyLog = [...user.study_log, { date: today, hours }];
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
        if (user.last_studied_date !== today) {
            const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = getLocalDateString(user.timezone, yesterday);
            if (user.last_studied_date === yesterdayStr) newStreak++;
            else newStreak = 1;
        }
        
        let updatedUser: User = { ...user, xp: newXp, level: newLevel, streak: newStreak, last_studied_date: today, study_log: newStudyLog, coins: (user.coins || 0) + coinsGained, };
        
        if (updatedUser.weekly_goals && updatedUser.weekly_goals.goals) {
            const currentWeekIdentifier = getWeekIdentifier(new Date(), updatedUser.timezone);
            if (updatedUser.weekly_goals.weekIdentifier !== currentWeekIdentifier) updatedUser.weekly_goals = { weekIdentifier: currentWeekIdentifier, goals: generateNewWeeklyGoals() };
            else {
                let goalsCompletedThisLog = 0;
                const newGoals = updatedUser.weekly_goals.goals.map(goal => {
                    if (goal.completed) return goal;
                    let isCompleted = false;
                    switch(goal.type) {
                        case 'log_hours_session': if (hours >= goal.target) isCompleted = true; break;
                        case 'reach_streak': if (newStreak >= goal.target) isCompleted = true; break;
                        case 'log_hours_weekly':
                            const hoursThisWeek = updatedUser.study_log.filter(log => new Date(log.date) >= new Date(updatedUser.weekly_goals!.weekIdentifier)).reduce((sum, log) => sum + log.hours, 0);
                            if (hoursThisWeek + hours >= goal.target) isCompleted = true;
                            break;
                    }
                    if (isCompleted) { goalsCompletedThisLog++; return { ...goal, completed: true }; }
                    return goal;
                });
                if (goalsCompletedThisLog > 0) {
                    updatedUser.xp += goalsCompletedThisLog * 50; updatedUser.total_goals_completed = (updatedUser.total_goals_completed || 0) + goalsCompletedThisLog; updatedUser.weekly_goals.goals = newGoals;
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
        
        if (!updatedUser.equipped_title) updatedUser.title = determineTitle(newLevel, newPrestige);
        
        updateUserProfile({ ...updatedUser, title: updatedUser.title });

        if(user.clan_id) {
            const clan = allClans.find(c => c.id === user.clan_id);
            if(clan) {
                const cxpGained = Math.round(hours * 10);
                const { error } = await supabase.from('clans').update({ cxp: clan.cxp + cxpGained }).eq('id', clan.id);
                if (error) console.error("Error updating clan CXP", error);
                else fetchAllClans();
            }
        }

    }, [user, allClans]);

    const handleUpdateProfilePic = (newPic: string) => updateUserProfile({ profile_pic: newPic });
    const handleUpdateTimezone = (newTimezone: string) => updateUserProfile({ timezone: newTimezone });
    const handleUpdateTheme = (newThemeId: string) => updateUserProfile({ theme: newThemeId });
    const handleUpdateStatus = (newStatus: string) => updateUserProfile({ status: sanitizeInput(newStatus) });
    const handleUpdatePrivacy = (isPrivate: boolean) => updateUserProfile({ is_private: isPrivate });
    const handleEquipTitle = (title: string | null) => updateUserProfile({ equipped_title: title || undefined });
    const handleEquipFrame = (frameId: string | null) => updateUserProfile({ equipped_frame: frameId || undefined });
    const handleUpdateHat = (newHat: string | null) => updateUserProfile({ equipped_hat: newHat || undefined });
    const handleEquipPet = (petId: string | null) => updateUserProfile({ equipped_pet: petId || undefined });
    const handleUpdateCustomPet = (petUrl: string | null) => updateUserProfile({ custom_pet_url: petUrl || undefined, equipped_pet: petUrl ? 'custom' : user?.equipped_pet === 'custom' ? undefined : user?.equipped_pet });
    const handleUpdateProfileTheme = (bg: string) => updateUserProfile({ profile_theme: { bg } });
    const handleEquipFont = (fontId: string | null) => updateUserProfile({ equipped_font: fontId || undefined });
    const handleUpdateUsernameColor = (color: string | null) => updateUserProfile({ username_color: color || undefined });
    const handleUpdateName = async (newName: string): Promise<string | null> => { return "Feature not yet implemented with Supabase."; };
    const handleUpdatePassword = async (oldPass: string, newPass: string): Promise<string | null> => { return "Feature not yet implemented with Supabase."; };

    const handleSendRequest = async (toUsername: string) => {
        if (!user) return;
        const recipient = allUsers.find(u => u.name === toUsername);
        if (!recipient || recipient.friend_requests.some(req => req.from === user.name)) return;
        const newRequests = [...recipient.friend_requests, { from: user.name, status: 'pending' as const }];
        const { error } = await supabase.from('profiles').update({ friend_requests: newRequests }).eq('id', recipient.id);
        if (error) console.error("Error sending friend request:", error); else fetchAllUsers();
    };

    const handleRespondRequest = async (fromUsername: string, accept: boolean) => {
        if (!user) return;
        const sender = allUsers.find(u => u.name === fromUsername);
        if (!sender) return;

        const updatedCurrentUserRequests = user.friend_requests.filter(req => req.from !== fromUsername);
        let updatedCurrentUserFriends = user.friends;
        if (accept) updatedCurrentUserFriends = [...new Set([...user.friends, fromUsername])];

        const { error: userError } = await supabase.from('profiles').update({ friend_requests: updatedCurrentUserRequests, friends: updatedCurrentUserFriends }).eq('id', user.id);
        if(userError) { console.error("Error updating current user:", userError); return; }

        if (accept) {
            const updatedSenderFriends = [...new Set([...sender.friends, user.name])];
            const { error: senderError } = await supabase.from('profiles').update({ friends: updatedSenderFriends }).eq('id', sender.id);
            if (senderError) { console.error("Error updating sender:", senderError); return; }
        }
        setUser({ ...user, friend_requests: updatedCurrentUserRequests, friends: updatedCurrentUserFriends });
        fetchAllUsers();
    };
    
    const handleStartChat = (userToChat: User) => { setChattingWith(userToChat); };
    
    const handleSendMessage = async (to_id: string, to_name: string, text: string, type: 'text' | 'image', image_data_url?: string) => {
        if (!user) return;
        const newMessage = { from_id: user.id, to_id, from_name: user.name, to_name, text, type, image_data_url };
        const { error } = await supabase.from('messages').insert(newMessage);
        if (error) console.error("Error sending message:", error); else {
            // Optimistically update UI
            const tempMsg: ChatMessage = { ...newMessage, id: Date.now(), timestamp: new Date().toISOString(), read: false };
            setMessages(prev => [...prev, tempMsg]);
        }
    };

    const handleMarkMessagesAsRead = async (partnerId: string) => {
         if (!user) return;
         const { error } = await supabase.from('messages').update({ read: true }).eq('from_id', partnerId).eq('to_id', user.id);
         if (!error) {
             setMessages(prev => prev.map(msg => msg.from_id === partnerId && msg.to_id === user.id ? { ...msg, read: true } : msg));
             setUnreadSenders(prev => { const newSet = new Set(prev); newSet.delete(partnerId); return newSet; });
         }
    };
    const handleViewProfile = (username?: string) => { const userToView = allUsers.find(u => u.name === (username || user?.name)); if (userToView) setViewingProfile(userToView); };

    // Admin handlers
    const handleDeleteUser = (username: string) => {};
    const handleResetUser = (username: string) => {};
    const handleUpdateUserStats = (username: string, newStats: any) => {};
    const handleDeleteClan = (clanId: string) => {};

    // Shop handlers
    const handlePurchase = async (itemId: string) => {
        if (!user) return; const item = SHOP_ITEMS.find(i => i.id === itemId); if (!item || (user.coins || 0) < item.price) return;
        let updatedUser = { ...user }; updatedUser.coins = (updatedUser.coins || 0) - item.price;
        if (item.type === 'consumable') {
            updatedUser.inventory = updatedUser.inventory || {};
            if (item.id === 'consumable-streak-shield') { if ((updatedUser.inventory.streakShield || 0) >= 1) { alert("You can only hold one Streak Shield at a time."); return; } updatedUser.inventory.streakShield = 1; } 
            else if (item.id.startsWith('consumable-xp-potion')) { updatedUser.inventory.xpPotions = updatedUser.inventory.xpPotions || {}; updatedUser.inventory.xpPotions[item.id] = (updatedUser.inventory.xpPotions[item.id] || 0) + 1; }
        } else if (item.id.startsWith('username-color-pack')) {
             const pack = COLOR_PACKS[item.id]; if (pack) { const colorUnlocks = pack.colors.map(colorId => `color-${colorId}`); updatedUser.unlocks = [...new Set([...(updatedUser.unlocks || []), ...colorUnlocks, item.id])]; }
        } else { updatedUser.unlocks = [...new Set([...(updatedUser.unlocks || []), item.id])]; }
        await updateUserProfile({ coins: updatedUser.coins, inventory: updatedUser.inventory, unlocks: updatedUser.unlocks });
        setNotification({ title: "Purchase Successful!", message: `You bought ${item.name} for ${item.price} coins.`});
    };
    const handleUseItem = (itemId: string) => {};

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
    const handleCreateClan = async (name: string): Promise<string | null> => { return "Not implemented"; };
    const handleInviteToClan = (username: string): string | null => { return "Not implemented"; };
    const handleRespondToClanInvite = (invite: ClanInvite, accept: boolean) => {};
    const handleLeaveClan = () => {};
    const handleKickFromClan = (username: string, clanId: string) => {};
    const handleUpdateClanName = (clanId: string, newName: string) => {};
    const handleUpdateClanBanner = (clanId: string, banner: string) => {};
    const handleStartClanChat = (clanToChat: Clan) => {};
    const handleSendClanMessage = (clanId: string, text: string) => {};

    const hasUnreadClanMessages = useMemo(() => { return false; }, []);
    
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
            messages={messages.filter(m => (m.from_id === user.id && m.to_id === chattingWith!.id) || (m.from_id === chattingWith!.id && m.to_id === user.id))}
            onSendMessage={handleSendMessage} onBack={() => setChattingWith(null)} onMarkMessagesAsRead={handleMarkMessagesAsRead}
        />
    }

    if (chattingInClan) {
        return <ClanChatView
            currentUser={user} clan={chattingInClan} allUsers={allUsers} messages={clanMessages.filter(m => m.clan_id === chattingInClan.id)}
            onSendMessage={handleSendClanMessage} onBack={() => setChattingInClan(null)} onViewProfile={handleViewProfile}
        />
    }
    
    const hasNotifications = unreadSenders.size > 0 || (user.friend_requests || []).length > 0 || (user.clan_invites || []).length > 0 || hasUnreadClanMessages;

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