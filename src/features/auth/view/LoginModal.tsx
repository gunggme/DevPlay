import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/Button';
import { useAppDispatch } from '@/store';
import { signInWithProvider } from '@/features/auth/model/authSlice';
import { Github } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(provider);
    try {
      await dispatch(signInWithProvider(provider));
      onClose();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md border border-border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">DevPlay에 로그인</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded"
              data-testid="close-modal-button"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => handleOAuthLogin('google')}
              variant="outline"
              className="w-full"
              isLoading={isLoading === 'google'}
              disabled={isLoading !== null}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 계속하기
            </Button>

            <Button
              onClick={() => handleOAuthLogin('github')}
              variant="outline"
              className="w-full"
              isLoading={isLoading === 'github'}
              disabled={isLoading !== null}
            >
              <Github className="w-5 h-5 mr-2" />
              GitHub로 계속하기
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              계속 진행하면{' '}
              <a href="/terms" className="underline hover:text-foreground">
                이용약관
              </a>
              과{' '}
              <a href="/privacy" className="underline hover:text-foreground">
                개인정보 처리방침
              </a>
              에 동의하게 됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}