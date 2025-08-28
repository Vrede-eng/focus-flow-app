export interface StudySession {
  date: string; // YYYY-MM-DD
  hours: number;
}

export interface FriendRequest {
  from: string; // user name
  status: 'pending';
}

export interface ChatMessage {
  id: string;
  from: string; // user name
  to: string; // user name
  text: string;
  timestamp: number;
  type: 'text' | 'image';
  imageDataUrl?: string; // base64
  read?: boolean;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type CoachMood = 'motivational' | 'talkative' | 'drill_sergeant';


export interface Theme {
  id:string;
  name: string;
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    placeholder: string;
  };
  accent: {
    gradient: string;
    primary: string;
  };
  font?: string;
}

export interface WeeklyGoal {
  id: string;
  text: string;
  completed: boolean;
  xp: number;
  type: 'log_hours_session' | 'log_hours_weekly' | 'reach_streak';
  target: number;
}

export interface WeeklyGoals {
  weekIdentifier: string; // e.g., "2024-07-22" (The Monday of the week)
  goals: WeeklyGoal[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: {
    title: string;
  };
  check: (user: User) => boolean;
}

export interface AchievementProgress {
  id: string; // achievement id
  unlockedAt: number; // timestamp
}

export interface Clan {
  id: string;
  name: string;
  leader: string; // leader's username
  members: string[]; // array of member usernames
  maxMembers: number;
  createdAt: number;
  // New progression fields
  level: number;
  cxp: number;
  banner: string; // Can be an icon ID like 'icon-1' or base64 data
  lastPerkClaimedDate?: string; // YYYY-MM-DD
}

export interface ClanChatMessage {
  id: string;
  clanId: string;
  from: string; // user name
  fromPic: string; // user profilePic
  text: string;
  timestamp: number;
}

export interface ClanInvite {
  clanId: string;
  clanName: string;
  from: string; // leader's name
}

export interface User {
  name: string;
  password?: string;
  profilePic: string; // e.g., 'avatar-1' or a base64 string
  level: number;
  xp: number;
  streak: number;
  lastStudiedDate: string | null;
  studyLog: StudySession[];
  friends: string[]; // array of friend names
  friendRequests: FriendRequest[]; // incoming friend requests
  timezone?: string;
  theme?: Theme['id'];
  title?: string; // Level-based title
  status?: string;
  isPrivate?: boolean;
  weeklyGoals?: WeeklyGoals;
  achievements?: AchievementProgress[];
  equippedTitle?: string;
  totalGoalsCompleted?: number;
  createdAt?: number; // timestamp
  hash?: string; // Data integrity hash
  isAdmin?: boolean;
  prestige?: number;
  // Shop-related fields
  coins?: number;
  inventory?: {
      streakShield?: number;
      xpPotions?: { [itemId: string]: number };
  };
  unlocks?: string[]; // Array of item IDs for themes, avatars, frames, features
  equippedFrame?: string; // ID of equipped frame
  equippedHat?: string; // base64 image data for the hat
  
  // New cosmetic fields
  equippedPet?: string; // ID of the equipped pet OR 'custom'
  customPetUrl?: string; // base64 image data for the pet
  profileTheme?: { bg: string; }; // bg can be a color hex or a base64 image url
  equippedFont?: string; // ID of the equipped font
  usernameColor?: string; // Hex color code

  // Clan fields
  clanId?: string;
  clanInvites?: ClanInvite[];
  lastReadClanTimestamp?: number;
}