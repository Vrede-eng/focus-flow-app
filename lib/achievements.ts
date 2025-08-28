import { Achievement, User } from '../types';

const getTotalHours = (user: User) => user.studyLog.reduce((sum, log) => sum + log.hours, 0);

export const ACHIEVEMENTS_LIST: Achievement[] = [
  // TIER 1: EASY
  {
    id: 'log_first_hour',
    name: 'First Step',
    description: 'Log your first study hour.',
    reward: { title: 'Initiate' },
    check: (user) => getTotalHours(user) >= 1,
  },
  {
    id: 'add_first_friend',
    name: 'Socializer',
    description: 'Add your first friend.',
    reward: { title: 'Social Butterfly' },
    check: (user) => user.friends.length >= 1,
  },
  {
    id: 'change_theme',
    name: 'Stylist',
    description: 'Change your app theme.',
    reward: { title: 'Aesthete' },
    check: (user) => user.theme !== 'blue',
  },
  {
    id: 'set_status',
    name: 'Expressive',
    description: 'Set a custom status.',
    reward: { title: 'Town Crier' },
    check: (user) => user.status !== 'Ready to start my journey!',
  },
  {
    id: 'complete_first_goal',
    name: 'Goal-Setter',
    description: 'Complete your first weekly goal.',
    reward: { title: 'Achiever' },
    check: (user) => (user.totalGoalsCompleted || 0) >= 1,
  },
  
  // TIER 2: CONSISTENCY & EARLY PROGRESS
  {
    id: 'level_5',
    name: 'Getting Started',
    description: 'Reach Level 5.',
    reward: { title: 'Apprentice' },
    check: (user) => user.level >= 5,
  },
  {
    id: 'streak_7_days',
    name: 'Week-Long Warrior',
    description: 'Reach a 7-day streak.',
    reward: { title: 'Committed' },
    check: (user) => user.streak >= 7,
  },
  {
    id: 'log_10_hours',
    name: 'Dabbler',
    description: 'Log 10 total study hours.',
    reward: { title: 'Dabbler' },
    check: (user) => getTotalHours(user) >= 10,
  },
  {
    id: 'complete_5_goals',
    name: 'Taskmaster',
    description: 'Complete 5 weekly goals.',
    reward: { title: 'Taskmaster' },
    check: (user) => (user.totalGoalsCompleted || 0) >= 5,
  },
  {
    id: 'add_5_friends',
    name: 'Networker',
    description: 'Have 5 friends.',
    reward: { title: 'Networker' },
    check: (user) => user.friends.length >= 5,
  },

  // TIER 3: JOURNEYMAN
  {
    id: 'level_10',
    name: 'Journeyman',
    description: 'Reach Level 10.',
    reward: { title: 'Journeyman' },
    check: (user) => user.level >= 10,
  },
  {
    id: 'streak_14_days',
    name: 'Tenacious',
    description: 'Reach a 14-day streak.',
    reward: { title: 'Tenacious' },
    check: (user) => user.streak >= 14,
  },
  {
    id: 'log_50_hours',
    name: 'Diligent',
    description: 'Log 50 total study hours.',
    reward: { title: 'Diligent Student' },
    check: (user) => getTotalHours(user) >= 50,
  },
  {
    id: 'log_8_hours_day',
    name: 'Marathoner',
    description: 'Log 8 hours in a single day.',
    reward: { title: 'Marathoner' },
    check: (user) => user.studyLog.some(log => log.hours >= 8), // This checks any single log entry, better to check sum for a day.
  },
  {
    id: 'complete_15_goals',
    name: 'Go-Getter',
    description: 'Complete 15 weekly goals.',
    reward: { title: 'Go-Getter' },
    check: (user) => (user.totalGoalsCompleted || 0) >= 15,
  },

  // TIER 4: ADEPT
  {
    id: 'level_20',
    name: 'Adept',
    description: 'Reach Level 20.',
    reward: { title: 'Adept' },
    check: (user) => user.level >= 20,
  },
  {
    id: 'streak_30_days',
    name: 'Monthly Maintainer',
    description: 'Reach a 30-day streak.',
    reward: { title: 'Devoted' },
    check: (user) => user.streak >= 30,
  },
  {
    id: 'log_100_hours',
    name: 'Centurion',
    description: 'Log 100 total study hours.',
    reward: { title: 'Centurion' },
    check: (user) => getTotalHours(user) >= 100,
  },
  {
    id: 'level_30',
    name: 'Expert',
    description: 'Reach Level 30.',
    reward: { title: 'Expert' },
    check: (user) => user.level >= 30,
  },
  {
    id: 'complete_30_goals',
    name: 'Overachiever',
    description: 'Complete 30 weekly goals.',
    reward: { title: 'Overachiever' },
    check: (user) => (user.totalGoalsCompleted || 0) >= 30,
  },

  // TIER 5: MASTER
  {
    id: 'level_40',
    name: 'Elite',
    description: 'Reach Level 40.',
    reward: { title: 'Elite' },
    check: (user) => user.level >= 40,
  },
  {
    id: 'streak_60_days',
    name: 'Unstoppable',
    description: 'Reach a 60-day streak.',
    reward: { title: 'Unstoppable' },
    check: (user) => user.streak >= 60,
  },
  {
    id: 'log_250_hours',
    name: 'Scholar',
    description: 'Log 250 total study hours.',
    reward: { title: 'Scholar' },
    check: (user) => getTotalHours(user) >= 250,
  },
  {
    id: 'level_50',
    name: 'Master',
    description: 'Reach Level 50.',
    reward: { title: 'Master' },
    check: (user) => user.level >= 50,
  },
   {
    id: 'log_10_hours_day',
    name: 'Full-Timer',
    description: 'Log 10 hours in a single day.',
    reward: { title: 'Full-Timer' },
    check: (user) => {
        const dailyTotals: {[key: string]: number} = {};
        user.studyLog.forEach(log => {
            dailyTotals[log.date] = (dailyTotals[log.date] || 0) + log.hours;
        });
        return Object.values(dailyTotals).some(total => total >= 10);
    },
  },

  // TIER 6: GRANDMASTER
  {
    id: 'streak_100_days',
    name: 'Legend',
    description: 'Reach a 100-day streak.',
    reward: { title: 'Legend' },
    check: (user) => user.streak >= 100,
  },
  {
    id: 'log_500_hours',
    name: 'Sage',
    description: 'Log 500 total study hours.',
    reward: { title: 'Sage' },
    check: (user) => getTotalHours(user) >= 500,
  },
  {
    id: 'level_75',
    name: 'Grandmaster',
    description: 'Reach Level 75.',
    reward: { title: 'Grandmaster' },
    check: (user) => user.level >= 75,
  },
  {
    id: 'complete_50_goals',
    name: 'Dominator',
    description: 'Complete 50 weekly goals.',
    reward: { title: 'Dominator' },
    check: (user) => (user.totalGoalsCompleted || 0) >= 50,
  },
  {
    id: 'log_1000_hours',
    name: 'Enlightened',
    description: 'Log 1000 total study hours.',
    reward: { title: 'Enlightened' },
    check: (user) => getTotalHours(user) >= 1000,
  }
];