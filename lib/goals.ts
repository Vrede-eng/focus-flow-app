import { WeeklyGoal } from '../types';
import { GOALS_LIST } from '../constants';

export const generateNewWeeklyGoals = (): WeeklyGoal[] => {
    const shuffled = [...GOALS_LIST].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(template => {
        const target = template.generateTarget();
        return {
            id: `${template.id}_${target}`,
            type: template.type,
            text: template.generateText(target),
            target: target,
            completed: false,
            xp: 50
        };
    });
}
