export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          locale: string;
          legal_use_consented_at: string | null;
          privacy_consented_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          locale?: string;
          legal_use_consented_at?: string | null;
          privacy_consented_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      grow_spaces: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          mode: string;
          approximate_region: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          mode: string;
          approximate_region?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["grow_spaces"]["Insert"]>;
      };
      plants: {
        Row: {
          id: string;
          user_id: string;
          space_id: string;
          name: string;
          variety: string | null;
          seed_profile_id: string | null;
          seed_type: string | null;
          custom_seed_notes: string | null;
          started_at: string | null;
          mode: string;
          pot: string | null;
          substrate: string | null;
          lighting: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          space_id: string;
          name: string;
          variety?: string | null;
          seed_profile_id?: string | null;
          seed_type?: string | null;
          custom_seed_notes?: string | null;
          started_at?: string | null;
          mode: string;
          pot?: string | null;
          substrate?: string | null;
          lighting?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plants"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
