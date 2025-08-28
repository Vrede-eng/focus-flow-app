

export enum Tab {
  Home = 'Home',
  Friends = 'Friends',
  Challenges = 'Challenges',
  AIAssistant = 'AI Assistant',
  Leaderboards = 'Leaderboards',
  Shop = 'Shop',
  Settings = 'Settings',
  Admin = 'Admin',
}

export const GOAL_COMPLETION_XP = 50;

type GoalTemplate = {
  id: string;
  type: 'log_hours_session' | 'log_hours_weekly' | 'reach_streak';
  generateText: (target: number) => string;
  generateTarget: () => number;
};


export const GOALS_LIST: GoalTemplate[] = [
  {
    id: 'log_hours_session',
    type: 'log_hours_session',
    generateText: target => `Study for ${target} hours in a single session.`,
    generateTarget: () => Math.random() > 0.5 ? 2 : 3,
  },
  {
    id: 'log_hours_weekly',
    type: 'log_hours_weekly',
    generateText: target => `Log a total of ${target} study hours this week.`,
    generateTarget: () => Math.floor(Math.random() * 6) + 5, // 5-10 hours
  },
  {
    id: 'reach_streak',
    type: 'reach_streak',
    generateText: target => `Reach a ${target}-day streak.`,
    generateTarget: () => {
        const choices = [3, 5, 7, 10];
        return choices[Math.floor(Math.random() * choices.length)];
    }
  },
  {
    id: 'log_hours_session_short',
    type: 'log_hours_session',
    generateText: target => `Complete a study block of at least ${target} minutes.`,
    generateTarget: () => {
        const choices = [60, 90];
        return choices[Math.floor(Math.random() * choices.length)] / 60; // target is in hours
    }
  },
  {
    id: 'log_hours_weekly_ambitious',
    type: 'log_hours_weekly',
    generateText: target => `Push yourself to study ${target} hours this week.`,
    generateTarget: () => Math.floor(Math.random() * 6) + 10, // 10-15 hours
  }
];