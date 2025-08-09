-- Row Level Security (RLS) 정책 설정

-- 1. profiles 테이블 RLS 정책
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 프로필을 볼 수 있음
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- 사용자는 자신의 프로필만 생성할 수 있음
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 프로필만 수정할 수 있음
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- 2. softwares 테이블 RLS 정책
ALTER TABLE public.softwares ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 소프트웨어를 볼 수 있음
CREATE POLICY "Softwares are viewable by everyone" 
  ON public.softwares FOR SELECT 
  USING (true);

-- 개발자와 관리자만 소프트웨어를 생성할 수 있음
CREATE POLICY "Developers can create software" 
  ON public.softwares FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('developer', 'admin')
    )
  );

-- 소프트웨어 소유자만 수정할 수 있음
CREATE POLICY "Software owners can update" 
  ON public.softwares FOR UPDATE 
  USING (
    developer_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 소프트웨어 소유자만 삭제할 수 있음
CREATE POLICY "Software owners can delete" 
  ON public.softwares FOR DELETE 
  USING (
    developer_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 3. software_versions 테이블 RLS 정책
ALTER TABLE public.software_versions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 버전을 볼 수 있음
CREATE POLICY "Software versions are viewable by everyone" 
  ON public.software_versions FOR SELECT 
  USING (true);

-- 소프트웨어 소유자만 버전을 추가할 수 있음
CREATE POLICY "Software owners can add versions" 
  ON public.software_versions FOR INSERT 
  WITH CHECK (
    software_id IN (
      SELECT id FROM public.softwares 
      WHERE developer_id IN (
        SELECT id FROM public.profiles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- 4. threads 테이블 RLS 정책
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 스레드를 볼 수 있음
CREATE POLICY "Threads are viewable by everyone" 
  ON public.threads FOR SELECT 
  USING (true);

-- 인증된 사용자는 스레드를 생성할 수 있음
CREATE POLICY "Authenticated users can create threads" 
  ON public.threads FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 작성자만 자신의 스레드를 수정할 수 있음
CREATE POLICY "Thread authors can update" 
  ON public.threads FOR UPDATE 
  USING (
    author_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 5. comments 테이블 RLS 정책
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 댓글을 볼 수 있음
CREATE POLICY "Comments are viewable by everyone" 
  ON public.comments FOR SELECT 
  USING (true);

-- 인증된 사용자는 댓글을 생성할 수 있음
CREATE POLICY "Authenticated users can create comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 작성자만 자신의 댓글을 수정할 수 있음
CREATE POLICY "Comment authors can update" 
  ON public.comments FOR UPDATE 
  USING (
    author_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 6. reactions 테이블 RLS 정책
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 반응을 볼 수 있음
CREATE POLICY "Reactions are viewable by everyone" 
  ON public.reactions FOR SELECT 
  USING (true);

-- 인증된 사용자는 반응을 추가할 수 있음
CREATE POLICY "Authenticated users can add reactions" 
  ON public.reactions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 사용자는 자신의 반응만 삭제할 수 있음
CREATE POLICY "Users can delete own reactions" 
  ON public.reactions FOR DELETE 
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 7. notifications 테이블 RLS 정책
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 알림만 볼 수 있음
CREATE POLICY "Users can view own notifications" 
  ON public.notifications FOR SELECT 
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );

-- 시스템만 알림을 생성할 수 있음 (서버 함수나 트리거를 통해)
-- INSERT 정책은 설정하지 않음 (서버 사이드에서만 생성)

-- 사용자는 자신의 알림만 수정할 수 있음 (읽음 표시)
CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (
    user_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  );