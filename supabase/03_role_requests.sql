  -- DevPlay 역할 요청 시스템 테이블 생성

  -- role_requests 테이블 생성
  CREATE TABLE IF NOT EXISTS public.role_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    requested_role TEXT NOT NULL CHECK (requested_role IN ('developer', 'admin')),
    "current_role" TEXT NOT NULL DEFAULT 'user',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reason TEXT,
    admin_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL,
    UNIQUE(user_id, requested_role, status) DEFERRABLE INITIALLY DEFERRED
  );

  -- 인덱스 생성
  CREATE INDEX IF NOT EXISTS idx_role_requests_user_id ON public.role_requests(user_id);
  CREATE INDEX IF NOT EXISTS idx_role_requests_status ON public.role_requests(status);
  CREATE INDEX IF NOT EXISTS idx_role_requests_reviewed_by ON public.role_requests(reviewed_by);

  -- Updated_at 트리거 적용
  CREATE TRIGGER update_role_requests_updated_at BEFORE UPDATE ON public.role_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  -- RLS 정책 설정
  ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

  -- 사용자는 자신의 요청만 조회/생성 가능
  CREATE POLICY "Users can view own role requests" ON public.role_requests
    FOR SELECT USING (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

  CREATE POLICY "Users can create own role requests" ON public.role_requests
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

  -- 관리자는 모든 요청 조회/수정 가능
  CREATE POLICY "Admins can view all role requests" ON public.role_requests
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );

  CREATE POLICY "Admins can update role requests" ON public.role_requests
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    ) WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    );

  -- 역할 요청 승인 시 profiles 테이블 업데이트하는 함수
  CREATE OR REPLACE FUNCTION handle_role_request_approval()
  RETURNS TRIGGER AS $$
  BEGIN
    -- 승인된 경우에만 실행
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
      -- 사용자 역할 업데이트
      UPDATE public.profiles 
      SET role = NEW.requested_role, updated_at = NOW()
      WHERE id = NEW.user_id;
      
      -- 알림 생성
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        NEW.user_id,
        'role_change',
        '역할 승인',
        CASE 
          WHEN NEW.requested_role = 'developer' THEN '개발자 권한이 승인되었습니다!'
          WHEN NEW.requested_role = 'admin' THEN '관리자 권한이 승인되었습니다!'
        END,
        NEW.id
      );
    END IF;
    
    -- 거절된 경우 알림 생성
    IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (
        NEW.user_id,
        'role_change',
        '역할 요청 거절',
        '역할 요청이 거절되었습니다. 관리자 메모: ' || COALESCE(NEW.admin_notes, '없음'),
        NEW.id
      );
    END IF;
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- 트리거 생성
  CREATE TRIGGER role_request_approval_trigger
    AFTER UPDATE ON public.role_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_role_request_approval();