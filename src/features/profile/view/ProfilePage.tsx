import { ProfileHeader } from '../components/ProfileHeader';
import { RoleManagement } from '../components/RoleManagement';
import { useProfileController } from '../controller/ProfileController';
import { Button } from '@/shared/ui/Button';
import { useState } from 'react';
import { LoginModal } from '@/features/auth/view/LoginModal';

export function ProfilePage() {
  const { 
    profile, 
    roleRequests, 
    canRequestDeveloper, 
    isAuthenticated,
    handleRequestDeveloper,
    isCreatingRequest
  } = useProfileController();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <div className="container mx-auto px-4 py-8" data-testid="profile-auth-required">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <svg className="size-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold">로그인이 필요합니다</h2>
              <p className="mb-6 text-muted-foreground">
                프로필을 보려면 먼저 로그인해주세요.
              </p>
              <Button 
                onClick={() => setShowLoginModal(true)}
                data-testid="profile-login-button"
              >
                로그인
              </Button>
            </div>
          </div>
        </div>
        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="profile-content">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">프로필</h1>
        
        <ProfileHeader profile={profile!} />

        <RoleManagement
          role={profile!.role}
          roleRequests={roleRequests}
          canRequestDeveloper={canRequestDeveloper}
          onRequestDeveloper={handleRequestDeveloper}
          isLoading={isCreatingRequest}
        />
      </div>
    </div>
  );
}