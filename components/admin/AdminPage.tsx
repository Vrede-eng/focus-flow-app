

import React, { useState, useMemo } from 'react';
import { User, Clan } from '../../types';
import Avatar from '../common/Avatar';
import ConfirmationModal from '../common/ConfirmationModal';
import { totalXpToReachLevel } from '../../lib/levels';
import ClanBanner from '../friends/ClanBanner';
import AdminAnalytics from './AdminAnalytics';

interface UserEditModalProps {
    user: User;
    onClose: () => void;
    onSave: (username: string, newStats: { level: number, xp: number, streak: number, prestige: number, equippedTitle: string, coins: number }) => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave }) => {
    const [level, setLevel] = useState(user.level.toString());
    const [xp, setXp] = useState(user.xp.toString());
    const [streak, setStreak] = useState(user.streak.toString());
    const [prestige, setPrestige] = useState((user.prestige || 0).toString());
    const [coins, setCoins] = useState((user.coins || 0).toString());
    // FIX: Changed equippedTitle to equipped_title
    const [equippedTitle, setEquippedTitle] = useState(user.equipped_title || '');


    React.useEffect(() => {
        const levelNum = parseInt(level, 10);
        if (!isNaN(levelNum) && levelNum > 0) {
            const requiredXp = totalXpToReachLevel(levelNum);
            setXp(requiredXp.toString());
        }
    }, [level]);

    const handleSave = () => {
        const newStats = {
            level: Math.max(1, Math.min(10000, parseInt(level, 10) || 1)),
            xp: parseInt(xp, 10) || 0,
            streak: parseInt(streak, 10) || 0,
            prestige: parseInt(prestige, 10) || 0,
            coins: parseInt(coins, 10) || 0,
            equippedTitle: equippedTitle,
        };
        onSave(user.name, newStats);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="p-6 rounded-2xl w-full max-w-sm" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <h2 className="text-xl font-bold mb-4">Edit {user.name}</h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label className="text-sm font-medium block" style={{ color: 'var(--color-text-secondary)' }}>Level</label>
                        <input type="number" value={level} onChange={e => setLevel(e.target.value)} className="w-full p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }} min="1" max="10000" />
                    </div>
                     <div>
                        <label className="text-sm font-medium block" style={{ color: 'var(--color-text-secondary)' }}>Prestige</label>
                        <input type="number" value={prestige} onChange={e => setPrestige(e.target.value)} className="w-full p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }} />
                    </div>
                    <div>
                        <label className="text-sm font-medium block" style={{ color: 'var(--color-text-secondary)' }}>XP (auto-calculated)</label>
                        <input type="number" value={xp} readOnly className="w-full p-2 rounded-lg opacity-70 cursor-not-allowed" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }} />
                    </div>
                    <div>
                        <label className="text-sm font-medium block" style={{ color: 'var(--color-text-secondary)' }}>Streak</label>
                        <input type="number" value={streak} onChange={e => setStreak(e.target.value)} className="w-full p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }} />
                    </div>
                    <div>
                        <label className="text-sm font-medium block" style={{ color: 'var(--color-text-secondary)' }}>Coins</label>
                        <input type="number" value={coins} onChange={e => setCoins(e.target.value)} className="w-full p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }} />
                    </div>
                    <div>
                        <label className="text-sm font-medium block" style={{ color: 'var(--color-text-secondary)' }}>Custom Title</label>
                        <input type="text" value={equippedTitle} onChange={e => setEquippedTitle(e.target.value)} placeholder="Leave blank for default" className="w-full p-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }} />
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg text-white font-semibold" style={{ background: 'var(--gradient-accent)' }}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

interface AdminPageProps {
    allUsers: User[];
    allClans: Clan[];
    currentUser: User;
    onDeleteUser: (username: string) => void;
    onResetUser: (username: string) => void;
    onUpdateUserStats: (username: string, newStats: { level: number, xp: number, streak: number, prestige: number, equippedTitle: string, coins: number }) => void;
    onDeleteClan: (clanId: string) => void;
}

type AdminTab = 'analytics' | 'users' | 'clans';

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-sm font-bold py-2 rounded-lg transition ${ !isActive && 'hover:opacity-80' }`}
        style={{
            background: isActive ? 'var(--gradient-accent)' : 'var(--color-bg-tertiary)',
            color: isActive ? 'white' : 'var(--color-text-primary)'
        }}
    >
        {label}
    </button>
);

const AdminPage: React.FC<AdminPageProps> = ({ allUsers, allClans, currentUser, onDeleteUser, onResetUser, onUpdateUserStats, onDeleteClan }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [clanSearchQuery, setClanSearchQuery] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        confirmText: string;
        confirmButtonClass: string;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: '', confirmButtonClass: '' });

    const filteredUsers = allUsers.filter(u =>
        !u.isAdmin && u.name.toLowerCase().includes(userSearchQuery.toLowerCase())
    );

    const filteredClans = allClans.filter(c =>
        c.name.toLowerCase().includes(clanSearchQuery.toLowerCase())
    );

    const handleDeleteUser = (username: string) => {
        setConfirmation({
            isOpen: true,
            title: `Delete User: ${username}`,
            message: `Are you sure you want to PERMANENTLY DELETE ${username}? This action cannot be undone.`,
            onConfirm: () => {
                onDeleteUser(username);
                setConfirmation({ ...confirmation, isOpen: false });
            },
            confirmText: 'Delete User',
            confirmButtonClass: 'bg-red-600 hover:bg-red-700',
        });
    };

    const handleResetUser = (username: string) => {
         setConfirmation({
            isOpen: true,
            title: `Reset User: ${username}`,
            message: `Are you sure you want to reset all progress for ${username}? Their level, XP, streak, and logs will be wiped.`,
            onConfirm: () => {
                onResetUser(username);
                setConfirmation({ ...confirmation, isOpen: false });
            },
            confirmText: 'Reset User',
            confirmButtonClass: 'bg-amber-600 hover:bg-amber-700',
        });
    };

    const handleDeleteClan = (clan: Clan) => {
        setConfirmation({
            isOpen: true,
            title: `Delete Clan: ${clan.name}`,
            message: `Are you sure you want to PERMANENTLY DELETE clan "${clan.name}"? This will remove all members from the clan and cannot be undone.`,
            onConfirm: () => {
                onDeleteClan(clan.id);
                setConfirmation({ ...confirmation, isOpen: false });
            },
            confirmText: 'Delete Clan',
            confirmButtonClass: 'bg-red-600 hover:bg-red-700',
        });
    };
    
    // Analytics Data Calculation
    const analyticsData = useMemo(() => {
        const nonAdminUsers = allUsers.filter(u => !u.isAdmin);

        // DAU (Daily Active Users) for the last 30 days
        const dailyActivity = new Map<string, Set<string>>();
        nonAdminUsers.forEach(user => {
            // FIX: Changed studyLog to study_log
            user.study_log.forEach(log => {
                const dateStr = log.date.split('T')[0];
                if (!dailyActivity.has(dateStr)) {
                    dailyActivity.set(dateStr, new Set());
                }
                dailyActivity.get(dateStr)!.add(user.name);
            });
        });
        const dauData: { label: string, value: number }[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const count = dailyActivity.get(dateStr)?.size || 0;
            dauData.push({ label, value: count });
        }

        // MAU (Monthly Active Users) for the last 12 months
        const monthlyActivity = new Map<string, Set<string>>();
        nonAdminUsers.forEach(user => {
            // FIX: Changed studyLog to study_log
            user.study_log.forEach(log => {
                const monthStr = log.date.substring(0, 7); // 'YYYY-MM'
                if (!monthlyActivity.has(monthStr)) {
                    monthlyActivity.set(monthStr, new Set());
                }
                monthlyActivity.get(monthStr)!.add(user.name);
            });
        });
        const mauData: { label: string, value: number }[] = [];
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthStr = date.toISOString().substring(0, 7);
            const label = date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
            const count = monthlyActivity.get(monthStr)?.size || 0;
            mauData.push({ label, value: count });
        }

        // New Users for the last 30 days
        const dailySignups = new Map<string, number>();
        nonAdminUsers.forEach(user => {
            // FIX: Changed createdAt to created_at
            if (user.created_at) {
                const date = new Date(user.created_at);
                const dateStr = date.toISOString().split('T')[0];
                dailySignups.set(dateStr, (dailySignups.get(dateStr) || 0) + 1);
            }
        });
        const newUsersData: { label: string, value: number }[] = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const count = dailySignups.get(dateStr) || 0;
            newUsersData.push({ label, value: count });
        }

        return { dauData, mauData, newUsersData };

    }, [allUsers]);


    const renderContent = () => {
        switch (activeTab) {
            case 'analytics':
                return <AdminAnalytics allUsers={allUsers} allClans={allClans} {...analyticsData} />;
            case 'users':
                return (
                    <>
                        <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                            <input
                                type="text"
                                placeholder="Search for users..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-bg-tertiary)' }}
                            />
                        </div>
                        <div className="space-y-3">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Users ({filteredUsers.length})</h2>
                            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                                {filteredUsers.map(user => (
                                    <div key={user.name} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 truncate">
                                                {/* FIX: Changed profilePic to profile_pic */}
                                                <Avatar profilePic={user.profile_pic} className="h-10 w-10" />
                                                <div className="truncate">
                                                    <p className="font-semibold truncate">{user.name}</p>
                                                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>P: {user.prestige || 0} | Lvl: {user.level} | Str: {user.streak} | Coins: {(user.coins || 0).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                                            <button onClick={() => setEditingUser(user)} className="py-1 px-2 rounded-md font-semibold" style={{backgroundColor: 'var(--color-accent-primary)', color: 'white'}}>Edit</button>
                                            <button onClick={() => handleResetUser(user.name)} className="py-1 px-2 rounded-md font-semibold" style={{backgroundColor: 'var(--color-bg-tertiary)'}}>Reset</button>
                                            <button onClick={() => handleDeleteUser(user.name)} className="py-1 px-2 rounded-md font-semibold bg-red-900/50 text-red-400 hover:bg-red-900/80 transition">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                );
            case 'clans':
                 return (
                    <>
                        <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                            <input
                                type="text"
                                placeholder="Search for clans..."
                                value={clanSearchQuery}
                                onChange={(e) => setClanSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-bg-tertiary)' }}
                            />
                        </div>
                        <div className="space-y-3">
                            <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Clans ({filteredClans.length})</h2>
                            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
                                {filteredClans.map(clan => (
                                    <div key={clan.id} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 truncate">
                                                <ClanBanner banner={clan.banner} className="h-10 w-10 rounded-lg flex-shrink-0" />
                                                <div className="truncate">
                                                    <p className="font-semibold truncate">{clan.name}</p>
                                                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Lvl: {clan.level} | Members: {clan.members.length} | Leader: {clan.leader}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteClan(clan)} className="py-1 px-3 rounded-md font-semibold bg-red-900/50 text-red-400 hover:bg-red-900/80 transition text-xs">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                );
            default: return null;
        }
    }
    
    return (
        <div className="p-6 space-y-6">
            <header>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Admin Panel</h1>
            </header>

            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <FilterButton label="Analytics" isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                <FilterButton label="Users" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <FilterButton label="Clans" isActive={activeTab === 'clans'} onClick={() => setActiveTab('clans')} />
            </div>

            {renderContent()}
           
            {editingUser && (
                <UserEditModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={onUpdateUserStats}
                />
            )}
            
            <ConfirmationModal 
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                message={confirmation.message}
                confirmText={confirmation.confirmText}
                confirmButtonClass={confirmation.confirmButtonClass}
            />
        </div>
    );
};

export default AdminPage;