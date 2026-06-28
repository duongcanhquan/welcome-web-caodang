/**
 * Kiểu dữ liệu Supabase — sẽ được mở rộng sau migration bước 2.
 * Dùng Database type cho supabase-js type-safe queries.
 */

export type EventShape = "tree" | "heart" | "apc" | string;

export interface Event {
  id: string;
  slug: string;
  name: string;
  status: "collecting" | "locked";
  created_at: string;
}

export interface EventSettings {
  event_id: string;
  shape: EventShape;
  majors: string[];
  fill_ratio: number;
  leaves_min: number;
  leaves_max: number;
  blossom_every: number;
  filler_assets: string[];
  trunk_config: Record<string, unknown>;
  roots_text: string;
  max_file_mb: number;
  rate_limit_per_ip: number;
  major_colors: Record<string, string>;
  policy_url: string | null;
  updated_at: string;
}

export interface Submission {
  id: string;
  event_id: string;
  token: string;
  name: string;
  dob: string;
  major: string;
  wish: string;
  leaf_url: string | null;
  photo_url: string | null;
  slot_index: number | null;
  x: number | null;
  y: number | null;
  rotation: number | null;
  scale: number | null;
  hidden: boolean;
  ip_hash: string | null;
  created_at: string;
}

export interface MosaicLeaf {
  submission_id?: string;
  filler?: boolean;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  major_color?: string;
}

export interface Mosaic {
  id: string;
  event_id: string;
  version: number;
  shape: EventShape;
  resolution: number;
  trunk_snapshot: Record<string, unknown>;
  roots_snapshot: Record<string, unknown>;
  leaves: MosaicLeaf[];
  created_at: string;
}

export interface GameScore {
  id: string;
  event_id: string;
  token: string;
  score: number;
  game_type: string;
  player_name: string | null;
  created_at: string;
}

export interface EventSecrets {
  event_id: string;
  deepseek_api_key: string | null;
  deepseek_model: string;
  ai_enabled: boolean;
  numerology_prompt: string | null;
  personalization_prompt: string | null;
  updated_at: string;
}

export interface SubmissionInsight {
  submission_id: string;
  numerology: Record<string, unknown>;
  ai_numerology: string | null;
  ai_personalization: Record<string, unknown>;
  ai_generated_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      events: {
        Row: Event;
        Insert: Omit<Event, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Event>;
      };
      event_settings: {
        Row: EventSettings;
        Insert: EventSettings;
        Update: Partial<EventSettings>;
      };
      submissions: {
        Row: Submission;
        Insert: Omit<Submission, "id" | "created_at" | "hidden"> & {
          id?: string;
          created_at?: string;
          hidden?: boolean;
        };
        Update: Partial<Submission>;
      };
      mosaics: {
        Row: Mosaic;
        Insert: Omit<Mosaic, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Mosaic>;
      };
      game_scores: {
        Row: GameScore;
        Insert: Omit<GameScore, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
          game_type?: string;
          player_name?: string | null;
        };
        Update: Partial<GameScore>;
      };
      event_secrets: {
        Row: EventSecrets;
        Insert: EventSecrets;
        Update: Partial<EventSecrets>;
      };
      submission_insights: {
        Row: SubmissionInsight;
        Insert: Omit<SubmissionInsight, "created_at"> & {
          created_at?: string;
        };
        Update: Partial<SubmissionInsight>;
      };
    };
  };
}
