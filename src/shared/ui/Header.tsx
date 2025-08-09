import { Link, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { useAppSelector, useAppDispatch } from '@/store';
import { signOut } from '@/features/auth/model/authSlice';
import { Bell, User, Code2, Home, MessageSquare, Settings } from 'lucide-react';
import { useState } from 'react';
import { LoginModal } from '@/features/auth/view/LoginModal';

export function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, profile } = useAppSelector((state) => state.auth);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await dispatch(signOut());
    navigate('/');
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
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
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
                        {profile?.username || 'User'}
                      </span>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg py-1">
                        <Link
                          to={`/profile/${profile?.username}`}
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
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-accent"
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