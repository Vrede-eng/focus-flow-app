import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import TargetIcon from '../common/icons/TargetIcon';

const getStartOfWeekDate = (date: Date, timezone: string): Date => {
    try {
        const d = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        const day = d.getDay(); // Sunday - 0, Monday - 1, ...
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    } catch {
        const d = new Date(date);
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setUTCDate(diff));
    }
}

interface WeeklyGoalsProps {
    user: User;
}

const WeeklyGoals: React.FC<WeeklyGoalsProps> = ({ user }) => {
    const [timeLeft, setTimeLeft] = useState('');
    // FIX: Changed weeklyGoals to weekly_goals to match User type
    const goals = user.weekly_goals?.goals || [];

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const startOfWeek = getStartOfWeekDate(now, user.timezone || 'UTC');
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 7);
            endOfWeek.setMilliseconds(endOfWeek.getMilliseconds() - 1);

            const diff = endOfWeek.getTime() - now.getTime();
            
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft('New goals soon!');
            }
        }, 1000);
        
        return () => clearInterval(timer);
    }, [user.timezone]);

    return (
        <div className="p-6 rounded-2xl shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Weekly Goals</h2>
                <p className="text-xs font-mono px-2 py-1 rounded-md" style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-accent-primary) 30%, transparent)',
                    color: 'var(--color-accent-primary)'
                }}>{timeLeft}</p>
            </div>
            {goals.length > 0 ? (
                <ul className="space-y-3">
                    {goals.map((goal) => (
                        <li key={goal.id} className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                            <div className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center" 
                                 style={{
                                    backgroundColor: goal.completed ? 'var(--color-accent-primary)' : 'var(--color-bg-primary)',
                                    color: 'white',
                                    border: goal.completed ? 'none' : '2px solid var(--color-text-secondary)'
                                 }}>
                                {goal.completed && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <div className={`text-sm leading-tight flex-1 ${goal.completed ? 'line-through opacity-70' : ''}`} style={{ color: 'var(--color-text-primary)' }}>
                                {goal.text}
                                <span className="text-xs font-bold" style={{color: 'var(--color-accent-primary)'}}> (+{goal.xp} XP)</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>
                    Your weekly goals will appear here soon.
                </p>
            )}
        </div>
    );
};

export default WeeklyGoals;