import type { Profile } from '@/shared/types';

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="mb-6 rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center space-x-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="size-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-muted-foreground">
              {profile.username?.charAt(0).toUpperCase() || ''}
            </span>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">{profile.username}</h2>
          <p className="capitalize text-muted-foreground">{profile.role}</p>
          {profile.bio && (
            <p className="mt-1 text-card-foreground">{profile.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}