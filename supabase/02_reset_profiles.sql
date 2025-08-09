-- DevPlay 프로필 테이블 완전 재설정 스크립트

-- 기존 테이블과 관련된 모든 것 정리
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- profiles 테이블 재생성 (강화된 버전)
CREATE TABLE public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE CHECK (length(trim(username)) >= 2 AND length(trim(username)) <= 20),
  bio TEXT DEFAULT NULL,
  avatar_url TEXT DEFAULT NULL,
  role TEXT DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'developer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 인덱스 생성
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Updated_at 트리거 함수 재생성
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정 (기존 정책 삭제 후 재생성)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 잘못된 기존 데이터 정리 (username이 null이거나 빈 문자열인 경우)
-- 이 스크립트 실행 후에는 모든 프로필이 유효한 username을 가져야 함

-- 성공 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ profiles 테이블이 완전히 재설정되었습니다!';
  RAISE NOTICE '📝 이제 모든 사용자는 새로 로그인할 때 닉네임을 설정해야 합니다.';
END
$$;