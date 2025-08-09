-- DevPlay 데이터베이스 스키마 초기화 스크립트

-- 기존 테이블 삭제 (순서 중요: 외래키 의존성 역순)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reactions CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.threads CASCADE;
DROP TABLE IF EXISTS public.software_versions CASCADE;
DROP TABLE IF EXISTS public.softwares CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. profiles 테이블 생성
CREATE TABLE public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'developer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. softwares 테이블 생성
CREATE TABLE public.softwares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  image_url TEXT,
  download_url TEXT NOT NULL,
  github_url TEXT,
  developer_id UUID NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  FOREIGN KEY (developer_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3. software_versions 테이블 생성
CREATE TABLE public.software_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  software_id UUID NOT NULL,
  version TEXT NOT NULL,
  changelog TEXT,
  download_url TEXT NOT NULL,
  release_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  FOREIGN KEY (software_id) REFERENCES public.softwares(id) ON DELETE CASCADE
);

-- 4. threads 테이블 생성
CREATE TABLE public.threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  software_id UUID,
  content TEXT NOT NULL,
  media_urls TEXT[],
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (software_id) REFERENCES public.softwares(id) ON DELETE SET NULL
);

-- 5. comments 테이블 생성
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL,
  author_id UUID NOT NULL,
  parent_id UUID,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  FOREIGN KEY (thread_id) REFERENCES public.threads(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE
);

-- 6. reactions 테이블 생성
CREATE TABLE public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID,
  comment_id UUID,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'cheer', 'bug', 'suggestion')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  FOREIGN KEY (thread_id) REFERENCES public.threads(id) ON DELETE CASCADE,
  FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE(thread_id, user_id, type),
  UNIQUE(comment_id, user_id, type),
  CHECK (
    (thread_id IS NOT NULL AND comment_id IS NULL) OR 
    (thread_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- 7. notifications 테이블 생성
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'reaction', 'follow', 'update', 'role_change', 'report')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_softwares_developer_id ON public.softwares(developer_id);
CREATE INDEX idx_threads_author_id ON public.threads(author_id);
CREATE INDEX idx_threads_software_id ON public.threads(software_id);
CREATE INDEX idx_comments_thread_id ON public.comments(thread_id);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);
CREATE INDEX idx_reactions_thread_id ON public.reactions(thread_id);
CREATE INDEX idx_reactions_comment_id ON public.reactions(comment_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Updated_at 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_softwares_updated_at BEFORE UPDATE ON public.softwares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_software_versions_updated_at BEFORE UPDATE ON public.software_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON public.threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();