

import React, { useState, useMemo } from 'react';
import { User, Clan } from '../../types';
import Avatar from '../common/Avatar';
import { FONTS } from '../../lib/fonts';
import ClanBanner from '../friends/ClanBanner';

type Metric = 'xp' | 'hours' | 'streak' | 'prestige' | 'level';
type Period = 'daily' | 'weekly' | 'all-time';
type Scope = 'global' | 'friends' | 'clans';

interface UserLeaderboardEntry extends Pick<User, 'name' | 'profilePic' | 'level' | 'isPrivate' | 'equippedTitle' | 'equippedFrame' | 'equippedHat' | 'equippedPet' | 'customPetUrl' | 'usernameColor' | 'equippedFont'> {
    score: number;
}
interface ClanLeaderboardEntry {
    id: string;
    name: string;
    leader: string;
    memberCount: number;
    score: number;
    totalMemberLevel: number;
    clanLevel: number;
    banner: string;
}

type LeaderboardEntry = UserLeaderboardEntry | ClanLeaderboardEntry;

interface LeaderboardsPageProps {
    currentUser: User;
    allUsers: User[];
    allClans: Clan[];
    onViewProfile: (username: string) => void;
}

const LeaderboardsPage: React.FC<LeaderboardsPageProps> = ({ currentUser, allUsers, allClans, onViewProfile }) => {
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

        if (scope === 'clans') {
            const clanData = allClans.map(clan => {
                const clanMembers = nonAdminUsers.filter(u => clan.members.includes(u.name));
                let totalScore = 0;
                let totalMemberLevel = 0;

                clanMembers.forEach(member => {
                    totalMemberLevel += member.level;
                    if (metric === 'prestige') {
                        totalScore += member.prestige || 0;
                        return;
                    }
                    if (metric === 'level') { // Clan level is the metric
                        totalScore = clan.level;
                        return;
                    }
                    if (metric === 'streak') {
                        totalScore += member.streak || 0;
                        return;
                    }
                    if (period === 'all-time') {
                        if (metric === 'xp') totalScore += member.xp;
                        else totalScore += member.studyLog.reduce((s, l) => s + l.hours, 0);
                    } else {
                        const relevantLogs = member.studyLog.filter(log => {
                            if (period === 'daily') return log.date === todayStr;
                            if (period === 'weekly') return log.date >= startOfWeekStr;
                            return false;
                        });
                        const totalHours = relevantLogs.reduce((s, l) => s + l.hours, 0);
                        totalScore += metric === 'xp' ? Math.round(totalHours * 100) : totalHours;
                    }
                });
                return { 
                    id: clan.id, name: clan.name, leader: clan.leader, memberCount: clan.members.length, score: totalScore, 
                    totalMemberLevel, clanLevel: clan.level, banner: clan.banner
                };
            });
            
            if (metric === 'level') {
                return clanData
                    .filter(c => c.score > 0)
                    .sort((a, b) => b.score - a.score || b.totalMemberLevel - a.totalMemberLevel)
                    .slice(0, 50);
            }
            if (metric === 'prestige') {
                 return clanData
                    .sort((a, b) => b.score - a.score || b.totalMemberLevel - a.totalMemberLevel)
                    .slice(0, 50);
            }

            return clanData
                .filter(c => c.score > 0)
                .sort((a, b) => b.score - a.score || b.totalMemberLevel - a.totalMemberLevel)
                .slice(0, 50);
        }

        const usersToDisplay = scope === 'friends'
            ? nonAdminUsers.filter(u => u.name === currentUser.name || currentUser.friends.includes(u.name))
            : nonAdminUsers;

        const mapUserToEntry = (user: User, score: number): UserLeaderboardEntry => ({
            name: user.name, profilePic: user.profilePic, score, level: user.level, isPrivate: user.isPrivate, equippedTitle: user.equippedTitle || user.title, equippedFrame: user.equippedFrame, equippedHat: user.equippedHat, equippedPet: user.equippedPet, customPetUrl: user.customPetUrl, usernameColor: user.usernameColor, equippedFont: user.equippedFont,
        });

        if (metric === 'prestige') {
            return usersToDisplay.map(user => mapUserToEntry(user, user.prestige || 0))
                .sort((a, b) => b.score - a.score || (b.level || 0) - (a.level || 0))
                .slice(0, 50);
        }
        
        if (metric === 'streak') {
            return usersToDisplay.map(user => mapUserToEntry(user, user.streak || 0))
                .filter(u => u.score > 0).sort((a, b) => b.score - a.score).slice(0, 50);
        }
        if (metric === 'level') { // Level doesn't make sense for users
            setMetric('xp');
            return [];
        }

        const calculated = usersToDisplay.map(user => {
            let score: number;
            if (period === 'all-time') {
                if (metric === 'xp') score = user.xp;
                else score = user.studyLog.reduce((sum, log) => sum + log.hours, 0);
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

        return calculated.filter(u => u.score > 0).sort((a, b) => b.score - a.score).slice(0, 50);

    }, [allUsers, allClans, metric, period, scope, currentUser]);

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
        if (metric === 'level') return 'Level';
        return '';
    }

    // When switching to clans, default to 'xp'. When switching away, if metric is 'level', default to 'xp'.
    React.useEffect(() => {
        if (scope !== 'clans' && metric === 'level') {
            setMetric('xp');
        }
    }, [scope, metric]);

    return (
        <div className="p-6 space-y-6">
            <header>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Leaderboards</h1>
            </header>

            <div className="space-y-4">
                 <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <FilterButton label="Global" value="global" currentValue={scope} setter={setScope} />
                    <FilterButton label="Friends" value="friends" currentValue={scope} setter={setScope} />
                    <FilterButton label="Clans" value="clans" currentValue={scope} setter={setScope} />
                </div>
                {scope === 'clans' ? (
                    <div className="grid grid-cols-5 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <FilterButton label="Level" value="level" currentValue={metric} setter={setMetric} />
                        <FilterButton label="XP" value="xp" currentValue={metric} setter={setMetric} />
                        <FilterButton label="Hours" value="hours" currentValue={metric} setter={setMetric} />
                        <FilterButton label="Streak" value="streak" currentValue={metric} setter={setMetric} />
                        <FilterButton label="Prestige" value="prestige" currentValue={metric} setter={setMetric} />
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <FilterButton label="XP" value="xp" currentValue={metric} setter={setMetric} />
                        <FilterButton label="Hours" value="hours" currentValue={metric} setter={setMetric} />
                        <FilterButton label="Streak" value="streak" currentValue={metric} setter={setMetric} />
                        <FilterButton label="Prestige" value="prestige" currentValue={metric} setter={setMetric} />
                    </div>
                )}
                {metric !== 'streak' && metric !== 'prestige' && metric !== 'level' && (
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
                        if (scope === 'clans') {
                            const clanEntry = entry as ClanLeaderboardEntry;
                            return (
                                <div key={clanEntry.id} className={`w-full flex items-center justify-between p-3 rounded-xl text-left`} style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                    <div className="flex items-center space-x-4 truncate">
                                        <span className="font-bold text-lg w-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>{index + 1}</span>
                                        <ClanBanner banner={clanEntry.banner} className="h-10 w-10 rounded-lg flex-shrink-0" />
                                        <div className="truncate">
                                            <p className="font-semibold truncate">{clanEntry.name}</p>
                                            <p className="text-xs truncate" style={{color: 'var(--color-text-secondary)'}}>
                                                {clanEntry.memberCount} members | Total Lvl: {clanEntry.totalMemberLevel.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-2">
                                        <span className="font-bold" style={{color: 'var(--color-accent-primary)'}}>
                                            {entry.score.toLocaleString(undefined, { maximumFractionDigits: metric === 'hours' ? 1 : 0 })}{' '}
                                            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{getUnit()}</span>
                                        </span>
                                        {metric !== 'level' && <p className="text-xs font-medium" style={{color: 'var(--color-text-secondary)'}}> Clan Lvl {clanEntry.clanLevel} </p>}
                                    </div>
                                </div>
                            );
                        }
                        
                        const userEntry = entry as UserLeaderboardEntry;
                        const isFriend = currentUser.friends.includes(userEntry.name);
                        const isCurrentUser = userEntry.name === currentUser.name;
                        const isPrivateAndNotFriend = userEntry.isPrivate && !isFriend && !isCurrentUser && scope === 'global';
                        const displayName = isPrivateAndNotFriend ? '(private account)' : userEntry.name;
                        
                        const isGold = userEntry.usernameColor === '#FFD700';
                        const usernameStyle: React.CSSProperties = {
                            fontFamily: userEntry.equippedFont ? FONTS[userEntry.equippedFont]?.family : 'inherit',
                        };
                         if (!isGold) {
                            usernameStyle.color = userEntry.usernameColor || 'var(--color-text-primary)';
                        }

                        return (
                            <button key={index} onClick={() => onViewProfile(userEntry.name)} disabled={isPrivateAndNotFriend} className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-opacity ${!isPrivateAndNotFriend && 'hover:opacity-80'} ${isCurrentUser ? 'border' : ''} disabled:cursor-default`} 
                                 style={{ backgroundColor: isCurrentUser ? 'color-mix(in srgb, var(--color-accent-primary) 25%, transparent)' : 'var(--color-bg-secondary)', borderColor: isCurrentUser ? 'var(--color-accent-primary)' : 'transparent' }}>
                                <div className="flex items-center space-x-4 truncate">
                                    <span className="font-bold text-lg w-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>{index + 1}</span>
                                    <Avatar profilePic={userEntry.profilePic} equippedFrame={userEntry.equippedFrame} equippedHat={userEntry.equippedHat} equippedPet={userEntry.equippedPet} customPetUrl={userEntry.customPetUrl} className="h-10 w-10" />
                                    <div className="truncate">
                                        <p className={`font-semibold truncate ${isGold ? 'gold-username' : ''}`} style={usernameStyle}>{displayName}</p>
                                        {userEntry.equippedTitle && !isPrivateAndNotFriend && (
                                            <p className="text-xs truncate" style={{color: 'var(--color-accent-primary)'}}>{userEntry.equippedTitle}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className="font-bold" style={{color: 'var(--color-accent-primary)'}}>
                                        {entry.score.toLocaleString(undefined, { maximumFractionDigits: metric === 'hours' ? 1 : 0 })}{' '}
                                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{getUnit()}</span>
                                    </span>
                                    {metric === 'prestige' && userEntry.level !== undefined && (
                                        <p className="text-xs font-medium" style={{color: 'var(--color-text-secondary)'}}> Level {userEntry.level} </p>
                                    )}
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="text-center py-10">
                        <p style={{ color: 'var(--color-text-secondary)' }}>
                            {scope === 'friends' && currentUser.friends.length === 0 ? "You haven't added any friends yet." : "No data for this period yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardsPage;