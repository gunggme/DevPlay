import { supabase } from './supabase';

export const debugSupabaseConnection = async () => {
  console.log('🔍 === Supabase Debug Start ===');
  
  try {
    // 1. 기본 연결 테스트
    console.log('🔧 1. Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(0);
    
    if (healthError) {
      console.error('❌ Connection test failed:', healthError);
      
      // 에러 코드별 원인 분석
      if (healthError.code === '42P01') {
        console.error('❌ profiles 테이블이 존재하지 않습니다!');
        console.log('💡 해결방법: supabase/01_profiles_only.sql 실행 필요');
      } else if (healthError.code === '42501') {
        console.error('❌ RLS 정책으로 인한 접근 거부');
        console.log('💡 해결방법: RLS 정책 확인 필요');
      } else {
        console.error('❌ 기타 Supabase 에러:', healthError);
      }
    } else {
      console.log('✅ Basic connection successful');
    }

    // 2. 현재 사용자 세션 확인
    console.log('🔍 2. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check error:', sessionError);
    } else if (!session) {
      console.log('⚠️ No active session found');
    } else {
      console.log('✅ Active session found:', {
        userId: session.user.id,
        email: session.user.email,
        provider: session.user.app_metadata?.provider,
        expiresAt: new Date(session.expires_at! * 1000).toLocaleString()
      });
      
      // 3. 현재 사용자의 프로필 확인
      if (session.user && !healthError) {
        console.log('🔍 3. Checking user profile...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('❌ Profile check error:', profileError);
        } else if (!profile) {
          console.log('⚠️ No profile found for current user');
          console.log('💡 이는 정상적인 상황입니다. 닉네임 설정이 필요합니다.');
        } else {
          console.log('✅ Profile found:', {
            id: profile.id,
            user_id: profile.user_id,
            username: profile.username,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
            role: profile.role,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            fullProfileObject: profile
          });
          
          // username 값 특별히 확인
          if (profile.username === undefined || profile.username === null || profile.username === 'undefined') {
            console.error('⚠️ PROBLEM FOUND: username is invalid:', {
              value: profile.username,
              type: typeof profile.username
            });
          }
        }
      }
    }
    
  } catch (error) { 
    console.error('❌ Debug function error:', error);
  }
  
  console.log('🏁 === Supabase Debug End ===');
};

// // 앱 시작시 자동 실행
// if (typeof window !== 'undefined') {
//   // 브라우저에서만 실행
//   setTimeout(debugSupabaseConnection, 1000);
// }