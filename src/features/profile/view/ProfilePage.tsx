import { ProfileHeader } from '../components/ProfileHeader';
import { RoleManagement } from '../components/RoleManagement';
import { useProfileController } from '../controller/ProfileController';

export function ProfilePage() {
  const { 
    profile, 
    roleRequests, 
    canRequestDeveloper, 
    isAuthenticated,
    handleRequestDeveloper,
    isCreatingRequest
  } = useProfileController();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <p>로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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