-- 프로필 테이블 테스트 쿼리

-- 1. 테이블 존재 확인
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'profiles';

-- 2. 컬럼 구조 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. 인덱스 확인
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
  AND schemaname = 'public';

-- 4. RLS 정책 확인
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND schemaname = 'public';

-- 5. RLS 활성화 상태 확인
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles' 
  AND schemaname = 'public';

-- 결과 해석:
-- - table_name이 'profiles'로 표시되면 테이블 생성 성공
-- - rowsecurity가 't' (true)이면 RLS 활성화됨
-- - 3개의 정책이 표시되어야 함 (SELECT, INSERT, UPDATE)