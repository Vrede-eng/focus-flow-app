

import React, { useState, useMemo } from 'react';
import { User } from '../../types';

// From GoalsPage
import WeeklyGoals from '../home/WeeklyGoals';
import CalendarHeatmap from './CalendarHeatmap';

// From AchievementsPage
import { ACHIEVEMENTS_LIST } from '../../lib/achievements';
import AchievementsList from '../settings/AchievementsList';
import ProgressBar from '../common/ProgressBar';

// --- Start of components & helpers moved from former GoalsPage.tsx ---

const getStartOfWeekDate = (date: Date, timezone: string): Date => {
    try {
        const d = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(d.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    } catch {
        const d = new Date(date);
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(d.setUTCDate(diff));
        startOfWeek.setUTCHours(0, 0, 0, 0);
        return startOfWeek;
    }
};

type GraphView = 'hours' | 'xp';
type GraphPeriod = 'weekly' | 'monthly';

const FilterButton: React.FC<{
    label: string;
    value: string;
    currentValue: string;
    setter: (value: any) => void;
}> = ({ label, value, currentValue, setter }) => (
    <button
        onClick={() => setter(value)}
        className={`w-full text-sm font-bold py-2 rounded-lg transition ${
            currentValue !== value && 'hover:opacity-80'
        }`}
        style={{
            background: currentValue === value ? 'var(--gradient-accent)' : 'var(--color-bg-tertiary)',
            color: currentValue === value ? 'white' : 'var(--color-text-primary)'
        }}
    >
        {label}
    </button>
);


const ActivityGraph: React.FC<{ user: User; view: GraphView; period: GraphPeriod }> = ({ user, view, period }) => {
    const chartData = useMemo(() => {
        const tz = user.timezone || 'UTC';

        if (period === 'weekly') {
            const startOfWeek = getStartOfWeekDate(new Date(), tz);
            const days = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(startOfWeek);
                d.setDate(startOfWeek.getDate() + i);
                return {
                    label: d.toLocaleDateString(undefined, { weekday: 'short' }),
                    dateStr: d.toLocaleDateString('en-CA'), // YYYY-MM-DD
                    value: 0,
                };
            });
    
            // FIX: Changed studyLog to study_log to match User type
            for (const log of user.study_log) {
                const logDateStr = log.date.split('T')[0];
                const dayData = days.find(d => d.dateStr === logDateStr);
                if (dayData) {
                    if (view === 'hours') {
                        dayData.value += log.hours;
                    } else { // view === 'xp'
                        dayData.value += Math.round(log.hours * 100);
                    }
                }
            }
            return days;
        } else { // period === 'monthly'
            const now = new Date();
            const year = now.getUTCFullYear();
            const month = now.getUTCMonth();
            
            const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
            const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));

            const firstDayOfMonthStr = firstDayOfMonth.toISOString().split('T')[0];
            const lastDayOfMonthStr = lastDayOfMonth.toISOString().split('T')[0];

            // FIX: Changed studyLog to study_log to match User type
            const monthlyLogs = user.study_log.filter(log => {
                const logDate = log.date.split('T')[0];
                return logDate >= firstDayOfMonthStr && logDate <= lastDayOfMonthStr;
            });

            const weeks = Array.from({ length: 5 }, (_, i) => ({
                label: `W${i + 1}`,
                value: 0,
            }));

            for (const log of monthlyLogs) {
                // Treat date as UTC to avoid timezone shifts from string conversion
                const logDate = new Date(log.date + 'T12:00:00Z');
                const dayOfMonth = logDate.getUTCDate();
                const weekIndex = Math.floor((dayOfMonth - 1) / 7);

                if (weekIndex >= 0 && weekIndex < 5) {
                    if (view === 'hours') {
                        weeks[weekIndex].value += log.hours;
                    } else { // view === 'xp'
                        weeks[weekIndex].value += Math.round(log.hours * 100);
                    }
                }
            }
            return weeks;
        }
        // FIX: Changed studyLog to study_log to match User type
    }, [user.study_log, user.timezone, view, period]);
    
    const maxValue = useMemo(() => {
        if (chartData.length === 0) return 1;
        const max = Math.max(...chartData.map(d => d.value));
        if (max === 0) {
            if (period === 'monthly') {
                return view === 'hours' ? 20 : 2000;
            }
            return view === 'hours' ? 5 : 500;
        }
        return max * 1.1; // Add 10% padding
    }, [chartData, view, period]);

    const title = period === 'weekly' 
        ? `This Week's Activity (${view === 'hours' ? "Hours" : "XP"})` 
        : `This Month's Activity (${view === 'hours' ? "Hours" : "XP"})`;
    const unit = view === 'hours' ? "hours" : "XP";
    
    return (
        <div className="p-6 rounded-2xl shadow-sm space-y-4" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
            </div>
            <div className="flex justify-between items-end h-48 pt-4" role="figure" aria-label={`${period} activity chart`}>
                {chartData.map((dataPoint, index) => (
                    <div key={index} className="flex flex-col items-center h-full w-full justify-end" >
                        <div className="text-xs font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                            {dataPoint.value > 0 ? dataPoint.value.toFixed(view === 'hours' ? 1 : 0) : ''}
                        </div>
                        <div className="w-3/5 h-full flex items-end">
                             <div 
                                className="w-full rounded-t-sm" 
                                style={{ 
                                    height: `${(dataPoint.value / maxValue) * 100}%`, 
                                    background: 'var(--gradient-accent)',
                                    transition: 'height 0.5s ease-out'
                                }}
                                aria-label={`${dataPoint.label}: ${dataPoint.value.toFixed(1)} ${unit}`}
                            ></div>
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{dataPoint.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- End of components & helpers ---

const ProgressView: React.FC<{ user: User }> = ({ user }) => {
    const [graphView, setGraphView] = useState<GraphView>('hours');
    const [graphPeriod, setGraphPeriod] = useState<GraphPeriod>('weekly');

    return (
        <div className="space-y-8">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <WeeklyGoals user={user} />
                 <div>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl mb-2 max-w-xs mx-auto" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <FilterButton label="This Week" value="weekly" currentValue={graphPeriod} setter={setGraphPeriod} />
                        <FilterButton label="This Month" value="monthly" currentValue={graphPeriod} setter={setGraphPeriod} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl mb-4 max-w-xs mx-auto" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        <FilterButton label="Hours" value="hours" currentValue={graphView} setter={setGraphView} />
                        <FilterButton label="XP" value="xp" currentValue={graphView} setter={setGraphView} />
                    </div>
                    <ActivityGraph user={user} view={graphView} period={graphPeriod} />
                </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--color-bg-tertiary)' }}>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Deeper Analytics</h2>
            </div>

            <div className="grid grid-cols-1 gap-8 items-start">
                {/* FIX: Changed studyLog to study_log to match User type */}
                <CalendarHeatmap studyLog={user.study_log} timezone={user.timezone || 'UTC'} />
            </div>
        </div>
    );
};

const AchievementsView: React.FC<{ user: User }> = ({ user }) => {
    const userAchievements = user.achievements || [];
    const totalAchievements = ACHIEVEMENTS_LIST.length;
    const unlockedCount = userAchievements.length;
    const progressPercentage = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

    return (
         <div className="space-y-8">
            <div className="p-6 rounded-2xl shadow-sm space-y-4 w-full" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <div className="flex justify-between items-center">
                     <h2 className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>Overall Progress</h2>
                     <p className="font-semibold" style={{color: 'var(--color-accent-primary)'}}>
                        {unlockedCount} / {totalAchievements} Unlocked
                    </p>
                </div>
                <ProgressBar progress={progressPercentage} />
            </div>
            
            <div className="space-y-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>All Achievements</h2>
                <AchievementsList
                    allAchievements={ACHIEVEMENTS_LIST}
                    userAchievements={userAchievements}
                />
            </div>
        </div>
    );
};


interface ChallengesPageProps {
    currentUser: User;
}

const ChallengesPage: React.FC<ChallengesPageProps> = ({ currentUser }) => {
    const [activeView, setActiveView] = useState<'progress' | 'achievements'>('progress');
    
    const TabButton: React.FC<{ label: string; value: typeof activeView; }> = ({ label, value }) => (
        <button
            onClick={() => setActiveView(value)}
            className={`w-full text-sm font-bold py-2 rounded-lg transition ${
                activeView !== value && 'hover:opacity-80'
            }`}
            style={{
                background: activeView === value ? 'var(--gradient-accent)' : 'var(--color-bg-tertiary)',
                color: activeView === value ? 'white' : 'var(--color-text-primary)'
            }}
        >
            {label}
        </button>
    );

    return (
        <div className="p-6 space-y-8">
            <header>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Challenges</h1>
                <p className="mt-1" style={{color: 'var(--color-text-secondary)'}}>Track your progress and unlock achievements.</p>
            </header>
             <div className="grid grid-cols-2 gap-2 p-1 rounded-xl max-w-md mx-auto" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <TabButton label="Progress & Goals" value="progress" />
                <TabButton label="Achievements" value="achievements" />
            </div>
            {activeView === 'progress' ? <ProgressView user={currentUser} /> : <AchievementsView user={currentUser} />}
        </div>
    );
};

export default ChallengesPage;