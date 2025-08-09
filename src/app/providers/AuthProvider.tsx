import React, { useEffect, useState, useRef } from 'react';
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
  const [initTimeout, setInitTimeout] = useState(false);
  
  // useRef로 상태 관리하여 비동기 로직 중단 방지
  const isInitializedRef = useRef(false);
  const isCancelledRef = useRef(false);
  const initializingRef = useRef(false);

  useEffect(() => {
    let isInitialized = false;
    let isCancelled = false;
    
    console.log('🔄 AuthProvider: Setting up auth state management...');

    // 초기 세션 복원 로직 (새로고침 시 중요)
    const initializeSession = async () => {
      if (isInitialized || isCancelled) return;
      
      console.log('🎯 Initializing session on mount/refresh...');
      isInitialized = true;
      
      try {
        const result = await dispatch(initializeAuth()).unwrap();
        console.log('✅ Session initialization completed:', result);
        
        if (result.user && !result.profile) {
          setNeedsNickname(true);
          setShowNicknameModal(true);
        } else if (result.user && result.profile) {
          dispatch(setProfile(result.profile));
          setNeedsNickname(false);
          setShowNicknameModal(false);
        }
      } catch (error) {
        console.error('❌ Session initialization failed:', error);
      }
    };

    // Auth state change listener (Supabase 공식 권장사항: async 작업을 setTimeout으로 분리)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔔 Auth state change:', { event, hasSession: !!session, userId: session?.user?.id });
        if (isCancelled) return;
        
        // 즉시 세션 상태 업데이트 (동기)
        dispatch(setSession(session));
        
        // 비동기 작업은 setTimeout으로 콜백 외부에서 실행 (데드락 방지)
        setTimeout(async () => {
          if (isCancelled) return;
          
          if (event === 'INITIAL_SESSION') {
            console.log('🎯 INITIAL_SESSION event detected');
            await initializeSession();
          } else if (event === 'SIGNED_IN') {
            console.log('🔑 SIGNED_IN event - user authenticated, reinitializing...');
            isInitialized = false; // 새 로그인이므로 재초기화 허용
            await initializeSession();
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 SIGNED_OUT event - clearing state');
            dispatch(setProfile(null));
            setNeedsNickname(false);
            setShowNicknameModal(false);
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 TOKEN_REFRESHED event - tokens updated');
          }
        }, 0);
      }
    );

    // 즉시 초기화 실행 (새로고침 시 onAuthStateChange 이벤트를 기다리지 않음)
    initializeSession();

    return () => {
      isCancelled = true;
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

  // 로딩 표시 - 사용자 상태가 아직 결정되지 않은 경우에만
  if (isLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <div className="ml-4 text-muted-foreground">
          인증 상태를 확인하는 중...
        </div>
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