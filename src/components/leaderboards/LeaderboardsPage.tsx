

import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import Avatar from '../common/Avatar';
import { FONTS } from '../../lib/fonts';

type Metric = 'xp' | 'hours' | 'streak' | 'prestige';
type Period = 'daily' | 'weekly' | 'all-time';
type Scope = 'global' | 'friends';

interface LeaderboardEntry extends Pick<User, 'name' | 'profilePic' | 'level' | 'isPrivate' | 'equippedTitle' | 'equippedFrame' | 'equippedHat' | 'equippedPet' | 'customPetUrl' | 'usernameColor' | 'equippedFont'> {
    score: number;
}


interface LeaderboardsPageProps {
    currentUser: User;
    allUsers: User[];
    onViewProfile: (username: string) => void;
}

const LeaderboardsPage: React.FC<LeaderboardsPageProps> = ({ currentUser, allUsers, onViewProfile }) => {
    const [metric, setMetric] = useState<Metric>('xp');
    const [period, setPeriod] = useState<Period>('all-time');
    const [scope, setScope] = useState<Scope>('global');

    const leaderboardData = useMemo<LeaderboardEntry[]>(() => {
        const timeZone = currentUser.timezone || 'UTC';
        const now = new Date();
        const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone }).format(now);
        const nowInTz = new Date(now.toLocaleString('en-US', { timeZone }));
        const dayOfWeek = nowInTz.getDay();
        const startOfWeek = new Date(nowInTz);
        startOfWeek.setDate(nowInTz.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        const startOfWeekStr = new Intl.DateTimeFormat('en-CA', { timeZone }).format(startOfWeek);

        const nonAdminUsers = allUsers.filter(u => !u.isAdmin);

        const usersToDisplay = scope === 'friends'
            ? nonAdminUsers.filter(u => u.name === currentUser.name || currentUser.friends.includes(u.name))
            : nonAdminUsers;

        const mapUserToEntry = (user: User, score: number): LeaderboardEntry => ({
            name: user.name,
            profilePic: user.profilePic,
            score,
            level: user.level,
            isPrivate: user.isPrivate,
            equippedTitle: user.equippedTitle || user.title,
            equippedFrame: user.equippedFrame,
            equippedHat: user.equippedHat,
            equippedPet: user.equippedPet,
            customPetUrl: user.customPetUrl,
            usernameColor: user.usernameColor,
            equippedFont: user.equippedFont,
        });

        if (metric === 'prestige') {
            return usersToDisplay
                .map(user => mapUserToEntry(user, user.prestige || 0))
                .sort((a, b) => {
                    if (b.score !== a.score) {
                        return b.score - a.score;
                    }
                    return (b.level || 0) - (a.level || 0);
                })
                .slice(0, 50);
        }
        
        if (metric === 'streak') {
            return usersToDisplay
                .map(user => mapUserToEntry(user, user.streak || 0))
                .filter(u => u.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 50);
        }

        const calculated = usersToDisplay.map(user => {
            let score: number;
            if (period === 'all-time') {
                if (metric === 'xp') {
                    score = user.xp;
                } else { // metric === 'hours'
                    score = user.studyLog.reduce((sum, log) => sum + log.hours, 0);
                }
            } else {
                const relevantLogs = user.studyLog.filter(log => {
                    if (period === 'daily') return log.date === todayStr;
                    if (period === 'weekly') return log.date >= startOfWeekStr;
                    return false;
                });
                const totalHours = relevantLogs.reduce((sum, log) => sum + log.hours, 0);
                score = metric === 'xp' ? Math.round(totalHours * 100) : totalHours;
            }
            
            return mapUserToEntry(user, score);
        });

        return calculated
            .filter(u => u.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 50);

    }, [allUsers, metric, period, scope, currentUser]);

    const FilterButton: React.FC<{
        label: string;
        value: string;
        currentValue: string;
        setter: (value: any) => void;
        disabled?: boolean;
    }> = ({ label, value, currentValue, setter, disabled }) => (
        <button
            onClick={() => setter(value)}
            disabled={disabled}
            className={`w-full text-sm font-bold py-2 rounded-lg transition ${
                currentValue !== value && 'hover:opacity-80'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
                background: currentValue === value ? 'var(--gradient-accent)' : 'var(--color-bg-tertiary)',
                color: currentValue === value ? 'white' : 'var(--color-text-primary)'
            }}
        >
            {label}
        </button>
    );
    
    const getUnit = () => {
        if (metric === 'xp') return 'XP';
        if (metric === 'hours') return 'hrs';
        if (metric === 'streak') return 'days';
        if (metric === 'prestige') return 'Prestige';
        return '';
    }

    return (
        <div className="p-6 space-y-6">
            <header>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Leaderboards</h1>
            </header>

            <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <FilterButton label="Global" value="global" currentValue={scope} setter={setScope} />
                    <FilterButton label="Friends" value="friends" currentValue={scope} setter={setScope} />
                </div>
                <div className="grid grid-cols-4 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <FilterButton label="XP" value="xp" currentValue={metric} setter={setMetric} />
                    <FilterButton label="Hours" value="hours" currentValue={metric} setter={setMetric} />
                    <FilterButton label="Streak" value="streak" currentValue={metric} setter={setMetric} />
                    <FilterButton label="Prestige" value="prestige" currentValue={metric} setter={setMetric} />
                </div>
                {metric !== 'streak' && metric !== 'prestige' && (
                    <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <FilterButton label="Daily" value="daily" currentValue={period} setter={setPeriod} />
                        <FilterButton label="Weekly" value="weekly" currentValue={period} setter={setPeriod} />
                        <FilterButton label="All Time" value="all-time" currentValue={period} setter={setPeriod} />
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {leaderboardData.length > 0 ? (
                    leaderboardData.map((entry, index) => {
                        const isFriend = currentUser.friends.includes(entry.name);
                        const isCurrentUser = entry.name === currentUser.name;
                        const isPrivateAndNotFriend = entry.isPrivate && !isFriend && !isCurrentUser && scope === 'global';
                        const displayName = isPrivateAndNotFriend ? '(private account)' : entry.name;
                        const usernameStyle: React.CSSProperties = {
                            color: entry.usernameColor || 'var(--color-text-primary)',
                            fontFamily: entry.equippedFont ? FONTS[entry.equippedFont]?.family : 'inherit',
                        };

                        return (
                            <button key={index} onClick={() => onViewProfile(entry.name)} disabled={isPrivateAndNotFriend} className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-opacity ${!isPrivateAndNotFriend && 'hover:opacity-80'} ${isCurrentUser ? 'border' : ''} disabled:cursor-default`} 
                                 style={{
                                     backgroundColor: isCurrentUser ? 'color-mix(in srgb, var(--color-accent-primary) 25%, transparent)' : 'var(--color-bg-secondary)',
                                     borderColor: isCurrentUser ? 'var(--color-accent-primary)' : 'transparent'
                                 }}>
                                <div className="flex items-center space-x-4 truncate">
                                    <span className="font-bold text-lg w-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>{index + 1}</span>
                                    <Avatar profilePic={entry.profilePic} equippedFrame={entry.equippedFrame} equippedHat={entry.equippedHat} equippedPet={entry.equippedPet} customPetUrl={entry.customPetUrl} className="h-10 w-10" />
                                    <div className="truncate">
                                        <p className="font-semibold truncate" style={usernameStyle}>
                                            {displayName}
                                        </p>
                                        {entry.equippedTitle && !isPrivateAndNotFriend && (
                                            <p className="text-xs truncate" style={{color: 'var(--color-accent-primary)'}}>{entry.equippedTitle}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className="font-bold" style={{color: 'var(--color-accent-primary)'}}>
                                        {entry.score.toLocaleString(undefined, { maximumFractionDigits: metric === 'hours' ? 1 : 0 })}{' '}
                                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{getUnit()}</span>
                                    </span>
                                    {metric === 'prestige' && entry.level !== undefined && (
                                        <p className="text-xs font-medium" style={{color: 'var(--color-text-secondary)'}}>
                                            Level {entry.level}
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="text-center py-10">
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            {scope === 'friends' && currentUser.friends.length === 0
                                ? "You haven't added any friends yet."
                                : "No data for this period yet."
                            }
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>
                            {scope === 'friends' && currentUser.friends.length === 0
                                ? "Add some friends to see them on the leaderboard!"
                                : "Log some study hours to get on the board!"
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardsPage;