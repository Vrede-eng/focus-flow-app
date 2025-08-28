export interface StudySession {
  date: string; // YYYY-MM-DD
  hours: number;
}

export interface FriendRequest {
  from: string; // user name
  status: 'pending';
}

export interface ChatMessage {
  id: number;
  from_id: string;
  to_id: string;
  from_name: string;
  to_name: string;
  text: string;
  timestamp: string; // ISO 8601 timestamp string
  type: 'text' | 'image';
  image_data_url?: string;
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
  id: string; // uuid
  name: string;
  leader: string; // leader's username
  members: string[]; // array of member usernames
  max_members: number;
  created_at: string;
  level: number;
  cxp: number;
  banner: string; // Can be an icon ID like 'icon-1' or base64 data
  last_perk_claimed_date?: string; // YYYY-MM-DD
}

export interface ClanChatMessage {
  id: number;
  clan_id: string;
  from_name: string;
  from_pic: string;
  text: string;
  timestamp: string;
}

export interface ClanInvite {
  clanId: string;
  clanName: string;
  from: string; // leader's name
}

export interface User {
  id: string; // Supabase auth user ID (uuid)
  name: string;
  profile_pic: string; // e.g., 'avatar-1' or a base64 string
  level: number;
  xp: number;
  streak: number;
  last_studied_date: string | null;
  study_log: StudySession[];
  friends: string[]; // array of friend names
  friend_requests: FriendRequest[]; // incoming friend requests
  timezone?: string;
  theme?: Theme['id'];
  title?: string; // Level-based title
  status?: string;
  is_private?: boolean;
  weekly_goals?: WeeklyGoals;
  achievements?: AchievementProgress[];
  equipped_title?: string;
  total_goals_completed?: number;
  created_at?: string; // timestamp
  isAdmin?: boolean;
  prestige?: number;
  // Shop-related fields
  coins?: number;
  inventory?: {
      streakShield?: number;
      xpPotions?: { [itemId: string]: number };
  };
  unlocks?: string[]; // Array of item IDs for themes, avatars, frames, features
  equipped_frame?: string; // ID of equipped frame
  equipped_hat?: string; // base64 image data for the hat
  
  // New cosmetic fields
  equipped_pet?: string; // ID of the equipped pet OR 'custom'
  custom_pet_url?: string; // base64 image data for the pet
  profile_theme?: { bg: string; }; // bg can be a color hex or a base64 image url
  equipped_font?: string; // ID of the equipped font
  username_color?: string; // Hex color code

  // Clan fields
  clan_id?: string;
  clan_invites?: ClanInvite[];
  last_read_clan_timestamp?: string;

  // FIX: Added optional password and hash for legacy local auth compatibility
  password?: string;
  hash?: string;
}