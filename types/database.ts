export interface User {
  id: string;
  email: string;
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
  };
}

export interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  created_at: string;
}

// Database schema types for Supabase
export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: Bookmark;
        Insert: Omit<Bookmark, 'id' | 'created_at'>;
        Update: Partial<Omit<Bookmark, 'id' | 'created_at'>>;
      };
    };
  };
}
