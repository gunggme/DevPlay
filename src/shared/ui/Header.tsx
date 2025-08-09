import { Link, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { useAppSelector, useAppDispatch } from '@/store';
import { signOut } from '@/features/auth/model/authSlice';
import { Bell, User, Code2, Home, MessageSquare, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { LoginModal } from '@/features/auth/view/LoginModal';

export function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, profile } = useAppSelector((state) => state.auth);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 디버그: 사용자 정보 상태 로깅
  useEffect(() => {
    const displayName = getDisplayName(profile, user);
    console.log('🏠 Header: User state changed:', {
      hasUser: !!user,
      hasProfile: !!profile,
      username: profile?.username,
      usernameType: typeof profile?.username,
      email: user?.email,
      displayName,
      fullProfile: profile
    });
  }, [user, profile]);

  // 안전한 displayName 추출 함수
  const getDisplayName = (profile: any, user: any): string => {
    // username이 유효한 문자열인지 확인
    if (profile?.username && 
        typeof profile.username === 'string' && 
        profile.username.trim() !== '' && 
        profile.username !== 'undefined' &&
        profile.username !== 'null') {
      return profile.username;
    }
    
    // fallback to email prefix
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  // 외부 클릭으로 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out...');
      await dispatch(signOut());
      console.log('Sign out successful, navigating to home');
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                <Code2 className="h-6 w-6" />
                DevPlay
              </Link>
              
              <nav className="hidden md:flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 text-sm hover:text-primary" data-testid="header-home-link">
                  <Home className="h-4 w-4" />
                  홈
                </Link>
                <Link to="/software" className="flex items-center gap-2 text-sm hover:text-primary" data-testid="header-software-link">
                  <Code2 className="h-4 w-4" />
                  소프트웨어
                </Link>
                <Link to="/threads" className="flex items-center gap-2 text-sm hover:text-primary" data-testid="header-threads-link">
                  <MessageSquare className="h-4 w-4" />
                  스레드
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <button className="relative p-2 hover:bg-accent rounded-md">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </button>
                  
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => {
                        console.log('User menu clicked, current state:', showUserMenu);
                        setShowUserMenu(!showUserMenu);
                      }}
                      className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
                      data-testid="user-menu-button"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                      <span className="text-sm font-medium hidden md:block">
                        {getDisplayName(profile, user)}
                      </span>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg py-1 z-50">
                        <Link
                          to={`/profile/${profile?.username || 'me'}`}
                          className="block px-4 py-2 text-sm hover:bg-accent"
                          onClick={() => setShowUserMenu(false)}
                        >
                          프로필
                        </Link>
                        {profile?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm hover:bg-accent"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className="h-4 w-4 inline mr-2" />
                            관리자
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-accent text-destructive hover:bg-destructive/10"
                          data-testid="logout-button"
                        >
                          로그아웃
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Button onClick={() => setShowLoginModal(true)} data-testid="login-button">
                  로그인
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    </>
  );
}