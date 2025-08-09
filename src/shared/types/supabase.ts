// Supabase 데이터베이스 타입 정의
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          bio: string | null
          avatar_url: string | null
          role: 'user' | 'developer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          bio?: string | null
          avatar_url?: string | null
          role?: 'user' | 'developer' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          bio?: string | null
          avatar_url?: string | null
          role?: 'user' | 'developer' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      softwares: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          tags: string[] | null
          image_url: string | null
          download_url: string
          github_url: string | null
          developer_id: string
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          tags?: string[] | null
          image_url?: string | null
          download_url: string
          github_url?: string | null
          developer_id: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          tags?: string[] | null
          image_url?: string | null
          download_url?: string
          github_url?: string | null
          developer_id?: string
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      software_versions: {
        Row: {
          id: string
          software_id: string
          version: string
          changelog: string | null
          download_url: string
          release_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          software_id: string
          version: string
          changelog?: string | null
          download_url: string
          release_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          software_id?: string
          version?: string
          changelog?: string | null
          download_url?: string
          release_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      threads: {
        Row: {
          id: string
          author_id: string
          software_id: string | null
          content: string
          media_urls: string[] | null
          score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          software_id?: string | null
          content: string
          media_urls?: string[] | null
          score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          software_id?: string | null
          content?: string
          media_urls?: string[] | null
          score?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          thread_id: string
          author_id: string
          parent_id: string | null
          content: string
          is_edited: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          author_id: string
          parent_id?: string | null
          content: string
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          author_id?: string
          parent_id?: string | null
          content?: string
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reactions: {
        Row: {
          id: string
          thread_id: string | null
          comment_id: string | null
          user_id: string
          type: 'like' | 'cheer' | 'bug' | 'suggestion'
          created_at: string
        }
        Insert: {
          id?: string
          thread_id?: string | null
          comment_id?: string | null
          user_id: string
          type: 'like' | 'cheer' | 'bug' | 'suggestion'
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string | null
          comment_id?: string | null
          user_id?: string
          type?: 'like' | 'cheer' | 'bug' | 'suggestion'
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'comment' | 'reply' | 'reaction' | 'follow' | 'update' | 'role_change' | 'report'
          title: string
          message: string
          related_id: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'comment' | 'reply' | 'reaction' | 'follow' | 'update' | 'role_change' | 'report'
          title: string
          message: string
          related_id?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'comment' | 'reply' | 'reaction' | 'follow' | 'update' | 'role_change' | 'report'
          title?: string
          message?: string
          related_id?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}