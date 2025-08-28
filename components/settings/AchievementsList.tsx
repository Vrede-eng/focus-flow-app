import React from 'react';
import { Achievement, AchievementProgress } from '../../types';

interface AchievementsListProps {
  allAchievements: Achievement[];
  userAchievements: AchievementProgress[];
}

const AchievementsList: React.FC<AchievementsListProps> = ({ allAchievements, userAchievements }) => {
  const unlockedIds = new Set(userAchievements.map(a => a.id));

  return (
    <div className="space-y-3">
      {allAchievements.map(ach => {
        const isUnlocked = unlockedIds.has(ach.id);
        return (
          <div
            key={ach.id}
            className={`p-4 rounded-xl transition-all duration-300 ${isUnlocked ? 'border-l-4' : 'opacity-60'}`}
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              borderColor: isUnlocked ? 'var(--color-accent-primary)' : 'transparent'
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{ach.name}</h4>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{ach.description}</p>
              </div>
              {isUnlocked && (
                <div className="flex-shrink-0 ml-4 text-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" style={{ color: 'var(--color-accent-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
              )}
            </div>
            <p className="text-xs mt-2 font-semibold" style={{ color: 'var(--color-accent-primary)' }}>
              Reward: Title "{ach.reward.title}"
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AchievementsList;
