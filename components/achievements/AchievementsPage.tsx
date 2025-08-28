
import React from 'react';
import { User } from '../../types';
import { ACHIEVEMENTS_LIST } from '../../lib/achievements';
import AchievementsList from '../settings/AchievementsList';
import ProgressBar from '../common/ProgressBar';

interface AchievementsPageProps {
    currentUser: User;
}

const AchievementsPage: React.FC<AchievementsPageProps> = ({ currentUser }) => {
    const userAchievements = currentUser.achievements || [];
    const totalAchievements = ACHIEVEMENTS_LIST.length;
    const unlockedCount = userAchievements.length;
    const progressPercentage = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

    return (
        <div className="p-6 space-y-8">
            <header>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Achievements</h1>
                <p className="mt-1" style={{color: 'var(--color-text-secondary)'}}>Unlock titles and celebrate your progress!</p>
            </header>

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

export default AchievementsPage;