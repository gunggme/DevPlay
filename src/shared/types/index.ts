// 전역 타입 정의
export type UserRole = 'user' | 'developer' | 'admin';

export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Software {
  id: string;
  name: string;
  description: string;
  category: string;
  tags?: string[];
  image_url?: string;
  download_url: string;
  github_url?: string;
  developer_id: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface SoftwareVersion {
  id: string;
  software_id: string;
  version: string;
  changelog?: string;
  download_url: string;
  release_date: string;
  created_at: string;
  updated_at: string;
}

export interface Thread {
  id: string;
  author_id: string;
  software_id?: string;
  content: string;
  media_urls?: string[];
  score: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  thread_id: string;
  author_id: string;
  parent_id?: string;
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export type ReactionType = 'like' | 'cheer' | 'bug' | 'suggestion';

export interface Reaction {
  id: string;
  thread_id?: string;
  comment_id?: string;
  user_id: string;
  type: ReactionType;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'comment' | 'reply' | 'reaction' | 'follow' | 'update' | 'role_change' | 'report';
  title: string;
  message: string;
  related_id?: string;
  read_at?: string;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Form Types
export interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
  isValid: boolean;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PageProps {
  title?: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}