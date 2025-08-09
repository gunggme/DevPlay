import React, { ReactNode, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Button } from './Button';
import { LoginModal } from '@/features/auth/view/LoginModal';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'user' | 'developer' | 'admin';
  fallbackMessage?: string;
  showLoginButton?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireRole = 'user',
  fallbackMessage = '로그인이 필요합니다',
  showLoginButton = true
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAppSelector((state) => state.auth);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Show loading spinner while authentication is being checked
  if (loading) {
    return (
      <div className="flex justify-center py-12" data-testid="auth-loading">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <>
        <div className="container mx-auto px-4 py-8" data-testid="auth-required">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <svg className="size-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold">{fallbackMessage}</h2>
              <p className="mb-6 text-muted-foreground">
                이 페이지에 접근하려면 로그인이 필요합니다.
              </p>
              {showLoginButton && (
                <Button 
                  onClick={() => setShowLoginModal(true)}
                  data-testid="protected-route-login-button"
                >
                  로그인
                </Button>
              )}
            </div>
          </div>
        </div>
        {showLoginButton && (
          <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        )}
      </>
    );
  }

  // Check role requirements
  if (requireRole && profile) {
    const roleHierarchy = {
      user: 0,
      developer: 1,
      admin: 2
    };

    const userLevel = roleHierarchy[profile.role as keyof typeof roleHierarchy] ?? -1;
    const requiredLevel = roleHierarchy[requireRole];

    if (userLevel < requiredLevel) {
      return (
        <div className="container mx-auto px-4 py-8" data-testid="insufficient-permissions">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                <svg className="size-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.734 0L3.98 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold">접근 권한이 없습니다</h2>
              <p className="mb-4 text-muted-foreground">
                이 페이지는 {requireRole === 'developer' ? '개발자' : '관리자'} 권한이 필요합니다.
              </p>
              <p className="text-sm text-muted-foreground">
                현재 권한: {profile.role === 'user' ? '일반 사용자' : profile.role === 'developer' ? '개발자' : '관리자'}
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  // If all checks pass, render the protected content
  return <div data-testid="protected-content">{children}</div>;
}