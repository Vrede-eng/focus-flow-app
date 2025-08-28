

import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import ProgressBar from '../common/ProgressBar';
import Avatar from '../common/Avatar';
import FireIcon from '../common/icons/FireIcon';
import LevelIcon from '../common/icons/LevelIcon';
import PrestigeIcon from '../common/icons/PrestigeIcon';
import { xpForLevelUp, totalXpToReachLevel, getPrestigeConfig } from '../../lib/levels';
import { getLocalDateString } from '../../lib/time';
import { FONTS } from '../../lib/fonts';

interface HomePageProps {
    user: User;
    onLogHours: (hours: number) => void;
    onLogout: () => void;
    onViewProfile: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ user, onLogHours, onLogout, onViewProfile }) => {
    const [hours, setHours] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [timeUntilReset, setTimeUntilReset] = useState('');

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        const calculateTimeUntilReset = () => {
            try {
                const now = new Date();
                const nowInTz = new Date(now.toLocaleString('en-US', { timeZone: user.timezone }));
                
                const tomorrow = new Date(nowInTz);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);

                const diff = tomorrow.getTime() - nowInTz.getTime();

                const h = Math.floor((diff / (1000 * 60 * 60)));
                const m = Math.floor((diff / 1000 / 60) % 60);
                const s = Math.floor((diff / 1000) % 60);

                setTimeUntilReset(
                    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
                );
            } catch {
                setTimeUntilReset('Calculating...');
            }
        };

        calculateTimeUntilReset(); // Initial calculation
        const timerId = setInterval(calculateTimeUntilReset, 1000);
        return () => clearInterval(timerId);
    }, [user.timezone]);

    const formattedDate = currentTime.toLocaleDateString(undefined, {
        timeZone: user.timezone,
        month: 'short',
        day: 'numeric'
    });

    const formattedTime = currentTime.toLocaleTimeString(undefined, {
        timeZone: user.timezone,
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const today = getLocalDateString(user.timezone);
    const hoursLoggedToday = user.studyLog
        .filter(log => log.date === today)
        .reduce((sum, log) => sum + log.hours, 0);
    const remainingHours = Math.max(0, 10 - hoursLoggedToday);

    const handleLogHours = (e: React.FormEvent) => {
        e.preventDefault();
        const hoursStudied = parseFloat(hours);
        if (!isNaN(hoursStudied) && hoursStudied > 0 && hoursStudied <= remainingHours) {
            onLogHours(hoursStudied);
            setHours('');
        } else if (remainingHours <= 0) {
            alert("You have already logged the maximum of 10 hours for today.");
        } else {
            alert(`Please enter a valid number of hours (up to ${remainingHours.toFixed(1)}).`);
        }
    };
    
    const xpNeededForNextLevel = xpForLevelUp(user.level);
    const totalXpForCurrentLevel = totalXpToReachLevel(user.level);
    const xpSinceLastLevelUp = user.xp - totalXpForCurrentLevel;
    const progressPercentage = Math.min(100, (xpSinceLastLevelUp / xpNeededForNextLevel) * 100);

    const prestigeInfo = getPrestigeConfig(user.prestige);
    const prestigeCap = prestigeInfo.cap;
    const prestigeProgressPercentage = prestigeCap === Infinity ? 100 : (user.level / prestigeCap) * 100;

    const isGold = user.usernameColor === '#FFD700';
    const usernameStyle: React.CSSProperties = {
        fontFamily: user.equippedFont ? FONTS[user.equippedFont]?.family : 'inherit',
    };
    if (!isGold) {
        usernameStyle.color = user.usernameColor || 'var(--color-text-primary)';
    }
    
    return (
        <div className="p-6 space-y-8">
            <header className="flex justify-between items-start">
                <button onClick={onViewProfile} className="flex items-center space-x-3 text-left">
                    <Avatar profilePic={user.profilePic} equippedFrame={user.equippedFrame} equippedHat={user.equippedHat} equippedPet={user.equippedPet} customPetUrl={user.customPetUrl} className="h-12 w-12" />
                    <div>
                        <h1 className={`text-2xl font-bold truncate ${isGold ? 'gold-username' : ''}`} style={usernameStyle}>{user.name}</h1>
                    </div>
                </button>
                <div className="text-right flex flex-col items-end">
                     <div className="flex items-baseline space-x-2">
                        <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>{formattedDate}</p>
                        <p className="font-mono text-sm" style={{ color: 'var(--color-text-secondary)' }}>{formattedTime}</p>
                    </div>
                    <button onClick={onLogout} className="text-sm font-medium hover:opacity-80 mt-1 md:hidden" style={{color: 'var(--color-accent-primary)'}}>
                        Logout
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl shadow-sm flex flex-col items-center justify-center space-y-1" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="bg-orange-500/20 p-2 rounded-full">
                        <FireIcon />
                    </div>
                    <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{user.streak}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Streak</p>
                </div>
                 <div className="p-4 rounded-xl shadow-sm flex flex-col items-center justify-center space-y-1" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="p-2 rounded-full" style={{backgroundColor: 'color-mix(in srgb, var(--color-accent-primary) 20%, transparent)'}}>
                        <LevelIcon />
                    </div>
                    <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{user.level}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Level</p>
                </div>
                 <div className="p-4 rounded-xl shadow-sm flex flex-col items-center justify-center space-y-1" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="p-2 rounded-full" style={{backgroundColor: 'color-mix(in srgb, var(--color-accent-primary) 20%, transparent)'}}>
                        <PrestigeIcon />
                    </div>
                    <p className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{user.prestige || 0}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Prestige</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-8">
                     <div className="p-6 rounded-2xl shadow-sm space-y-4 w-full" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Level Progress</h2>
                        <ProgressBar progress={progressPercentage} />
                        <div className="flex justify-between text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            <span>{xpSinceLastLevelUp.toFixed(0)} XP</span>
                            <span>{xpNeededForNextLevel} XP</span>
                        </div>
                    </div>

                    {prestigeCap !== Infinity && (
                        <div className="p-6 rounded-2xl shadow-sm space-y-4 w-full" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                            <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Prestige Progress</h2>
                            <ProgressBar progress={prestigeProgressPercentage} />
                            <div className="flex justify-between text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                <span>Level {user.level} / {prestigeCap}</span>
                                <span className="font-bold" style={{color: 'var(--color-accent-primary)'}}>{prestigeInfo.multiplier}x Boost</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 rounded-2xl shadow-sm space-y-4 w-full" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                     <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Log Study Session</h2>
                     <form onSubmit={handleLogHours} className="flex flex-col">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="number"
                                step="0.1"
                                min="0.1"
                                max={remainingHours.toFixed(1)}
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                placeholder={`Hours (max ${remainingHours.toFixed(1)})`}
                                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition disabled:opacity-50"
                                style={{
                                    backgroundColor: 'var(--color-bg-tertiary)',
                                    color: 'var(--color-text-primary)',
                                    borderColor: 'var(--color-accent-primary)'
                                }}
                                disabled={remainingHours <= 0}
                            />
                            <button 
                                type="submit" 
                                style={{ background: 'var(--gradient-accent)' }}
                                className="text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={remainingHours <= 0}
                            >
                                Log
                            </button>
                        </div>
                        <div className="text-xs mt-2 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                            {remainingHours < 10 && (
                                <span>You have logged {hoursLoggedToday.toFixed(1)} of 10 hours today.</span>
                            )}
                            <span className="font-mono block mt-1">
                                {timeUntilReset} left today
                            </span>
                        </div>
                     </form>
                </div>
            </div>
        </div>
    );
};

export default HomePage;