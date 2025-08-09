# Supabase 데이터베이스 설정 가이드

## 🚨 404 에러 해결 방법

Supabase에서 404 에러가 발생하는 경우, 대부분 테이블이 생성되지 않았거나 RLS(Row Level Security) 정책이 설정되지 않았기 때문입니다.

## 📋 빠른 설정 단계 (단계별 설치)

### 1. Supabase 대시보드 접속
1. [Supabase Dashboard](https://app.supabase.com)에 로그인
2. 프로젝트 선택 (ehfjaapwuvhdjfpmnnkh)

### 2. 1단계: 프로필 테이블만 먼저 생성
1. 좌측 메뉴에서 **SQL Editor** 클릭
2. **New Query** 클릭
3. `supabase/01_profiles_only.sql` 파일의 내용 전체를 복사하여 붙여넣기
4. **Run** 버튼 클릭하여 실행
5. "✅ profiles 테이블이 성공적으로 생성되었습니다!" 메시지 확인

### 3. 테스트 쿼리로 확인
1. 새로운 쿼리 탭 생성
2. `supabase/test_profiles.sql` 파일의 내용을 복사하여 붙여넣기
3. **Run** 버튼 클릭하여 실행
4. 다음 결과가 나오는지 확인:
   - `table_name = 'profiles'`
   - `rowsecurity = t` (RLS 활성화)
   - 3개의 정책이 표시됨

### 4. 애플리케이션 테스트
- 이제 로그인 후 닉네임 설정이 작동해야 합니다
- 브라우저 콘솔에서 에러가 없는지 확인

### 5. (선택사항) 전체 테이블 생성
- 기본 기능이 작동하면 나중에 `supabase/schema.sql` 실행하여 모든 테이블 생성

### 4. Storage 버킷 생성 (선택사항)
```sql
-- Storage 버킷 생성 (아바타 이미지용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Storage 정책 설정
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars');
```

## 🔍 테이블 확인 방법

### Table Editor에서 확인
1. 좌측 메뉴에서 **Table Editor** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - `profiles`
   - `softwares`
   - `software_versions`
   - `threads`
   - `comments`
   - `reactions`
   - `notifications`

### SQL로 확인
```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- RLS 정책 확인
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

## 🛠️ 일반적인 문제 해결

### 1. "relation 'profiles' does not exist" 에러
- **원인**: profiles 테이블이 생성되지 않음
- **해결**: `supabase/schema.sql` 실행

### 2. "new row violates row-level security policy" 에러
- **원인**: RLS 정책이 설정되지 않았거나 잘못 설정됨
- **해결**: `supabase/rls_policies.sql` 실행

### 3. "duplicate key value violates unique constraint" 에러
- **원인**: 이미 존재하는 username 또는 user_id로 프로필 생성 시도
- **해결**: 다른 username 사용 또는 기존 프로필 확인

### 4. 로그인은 되지만 프로필이 생성되지 않는 경우
- **원인**: RLS 정책이 INSERT를 차단
- **해결**: RLS 정책 재확인 및 재설정

## 📝 테스트 쿼리

### 프로필 테이블 테스트
```sql
-- 프로필 조회 (현재 로그인한 사용자)
SELECT * FROM profiles 
WHERE user_id = auth.uid();

-- 모든 프로필 조회 (관리자용)
SELECT * FROM profiles;
```

### RLS 정책 테스트
```sql
-- RLS가 활성화되어 있는지 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

## 🔐 OAuth 설정 확인

### Google OAuth 설정
1. Supabase Dashboard > Authentication > Providers
2. Google 활성화 확인
3. Authorized redirect URLs 확인:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5174/auth/callback`

### GitHub OAuth 설정
1. Supabase Dashboard > Authentication > Providers
2. GitHub 활성화 확인
3. Authorized redirect URLs 확인

## 💡 개발 팁

1. **브라우저 콘솔 확인**: F12를 눌러 개발자 도구를 열고 Console 탭에서 에러 메시지 확인
2. **네트워크 탭 확인**: Network 탭에서 Supabase API 요청/응답 확인
3. **Supabase Logs**: Dashboard > Logs에서 실시간 로그 확인

## 📧 지원

문제가 지속되는 경우:
1. 브라우저 콘솔의 전체 에러 메시지 캡처
2. Supabase Dashboard의 Logs 확인
3. `.env` 파일의 환경변수 재확인