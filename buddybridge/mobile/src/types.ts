export type User = {
  id: string;
  name: string;
  age_range?: string | null;
  interests: string[];
  vibe: "gentle" | "fun" | "deep" | "minimal";
  prefers_group: number;
  ai_enabled: boolean;
};

export type Match = {
  user: User;
  score: number;
  why: string[];
};

export type Wingman = {
  enabled: boolean;
  suggestions: string[];
  wingman_in_chat: string | null;
};

export type ChatMsg = {
  sender_id: string;
  text: string;
  ts: number;
};
