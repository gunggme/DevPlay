/**
 * Supabase 데드락 방지 헬퍼 유틸리티
 * 
 * 🚨 중요: onAuthStateChange 콜백에서 await을 사용하면 데드락이 발생합니다.
 * 이 유틸리티를 사용하여 안전하게 비동기 작업을 처리하세요.
 * 
 * 참고: https://supabase.com/docs/guides/troubleshooting/why-is-my-supabase-api-call-not-returning-PGzXw0
 */

import { supabase } from './supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * onAuthStateChange 콜백에서 안전하게 비동기 작업을 실행하는 헬퍼
 * 
 * @example
 * ```typescript
 * supabase.auth.onAuthStateChange((event, session) => {
 *   // 즉시 실행할 동기 작업
 *   dispatch(setSession(session));
 *   
 *   // 비동기 작업은 이 헬퍼로 안전하게 실행
 *   safeAsyncInAuthCallback(async () => {
 *     const { data } = await supabase.from('profiles').select('*');
 *     // 비동기 작업 처리
 *   });
 * });
 * ```
 */
export function safeAsyncInAuthCallback(asyncFn: () => Promise<void>): void {
  setTimeout(async () => {
    try {
      await asyncFn();
    } catch (error) {
      console.error('🚨 safeAsyncInAuthCallback error:', error);
    }
  }, 0);
}

/**
 * 안전한 onAuthStateChange 래퍼 함수
 * 동기와 비동기 작업을 명확히 분리합니다.
 * 
 * @param syncCallback - 즉시 실행할 동기 작업 (Redux dispatch 등)
 * @param asyncCallback - setTimeout으로 실행할 비동기 작업
 * 
 * @example
 * ```typescript
 * const subscription = createSafeAuthStateListener({
 *   syncCallback: (event, session) => {
 *     dispatch(setSession(session));
 *   },
 *   asyncCallback: async (event, session) => {
 *     if (event === 'SIGNED_IN' && session?.user) {
 *       const { data } = await supabase.from('profiles').select('*');
 *       // 비동기 처리
 *     }
 *   }
 * });
 * 
 * // 언마운트 시 구독 해제
 * subscription.unsubscribe();
 * ```
 */
export function createSafeAuthStateListener(options: {
  syncCallback?: (event: AuthChangeEvent, session: Session | null) => void;
  asyncCallback?: (event: AuthChangeEvent, session: Session | null) => Promise<void>;
}) {
  const { syncCallback, asyncCallback } = options;

  return supabase.auth.onAuthStateChange((event, session) => {
    // 즉시 실행할 동기 작업
    if (syncCallback) {
      syncCallback(event, session);
    }

    // 비동기 작업은 setTimeout으로 안전하게 실행
    if (asyncCallback) {
      safeAsyncInAuthCallback(() => asyncCallback(event, session));
    }
  });
}

/**
 * React 컴포넌트에서 사용하기 쉬운 커스텀 훅
 * 
 * @example
 * ```typescript
 * function AuthProvider() {
 *   const dispatch = useAppDispatch();
 *   
 *   useSupabaseAuth({
 *     onSync: (event, session) => {
 *       dispatch(setSession(session));
 *     },
 *     onAsync: async (event, session) => {
 *       if (event === 'INITIAL_SESSION' && session?.user) {
 *         const result = await dispatch(initializeAuth()).unwrap();
 *         // 초기화 로직 처리
 *       }
 *     }
 *   });
 * 
 *   return <>{children}</>;
 * }
 * ```
 */
export function useSupabaseAuth(options: {
  onSync?: (event: AuthChangeEvent, session: Session | null) => void;
  onAsync?: (event: AuthChangeEvent, session: Session | null) => Promise<void>;
}) {
  const { onSync, onAsync } = options;

  React.useEffect(() => {
    const { data: { subscription } } = createSafeAuthStateListener({
      syncCallback: onSync,
      asyncCallback: onAsync
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onSync, onAsync]);
}

// React import (필요한 경우만)
import React from 'react';