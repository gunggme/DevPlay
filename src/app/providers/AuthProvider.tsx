import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { initializeAuth, setSession, setProfile } from '@/features/auth/model/authSlice';
import { supabase } from '@/shared/lib/supabase';
import { NicknameModal } from '@/features/auth/view/NicknameModal';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const user = useAppSelector((state) => state.auth.user);
  const profile = useAppSelector((state) => state.auth.profile);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [needsNickname, setNeedsNickname] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const result = await dispatch(initializeAuth()).unwrap();
      
      // 초기 로드 시 사용자는 있지만 프로필이 없는 경우
      if (result.session?.user && !result.profile) {
        setNeedsNickname(true);
        setShowNicknameModal(true);
      }
    };
    
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        dispatch(setSession(session));
        
        if (event === 'SIGNED_IN' && session?.user) {
          // 프로필 확인
          console.log('Checking profile for user:', session.user.id);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle(); // single() 대신 maybeSingle() 사용

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
          }

          if (!profile) {
            // 프로필이 없으면 닉네임 모달 표시
            console.log('No profile found, showing nickname modal');
            setNeedsNickname(true);
            setShowNicknameModal(true);
          } else {
            console.log('Profile found:', profile);
            dispatch(setProfile(profile));
            setNeedsNickname(false);
            setShowNicknameModal(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setNeedsNickname(false);
          setShowNicknameModal(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  // 프로필이 생성되면 모달 닫기
  useEffect(() => {
    if (profile && showNicknameModal) {
      setShowNicknameModal(false);
      setNeedsNickname(false);
    }
  }, [profile, showNicknameModal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 닉네임이 필요한 경우 모달만 표시하고 다른 콘텐츠는 차단
  if (needsNickname && user) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <NicknameModal isOpen={true} userId={user.id} />
        </div>
      </>
    );
  }

  return <>{children}</>;
}