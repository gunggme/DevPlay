import { useAppSelector } from '@/store';
import { useCreateRoleRequest, useUserRoleRequests } from '@/shared/hooks/useRoleRequests';
import { Button } from '@/shared/ui/Button';
import { useState } from 'react';

export function ProfilePage() {
  const { user, profile } = useAppSelector((state) => state.auth);
  const { data: roleRequests } = useUserRoleRequests();
  const createRoleRequest = useCreateRoleRequest();
  const [requestReason, setRequestReason] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);

  const canRequestDeveloper = profile?.role === 'user' && 
    !roleRequests?.some(req => req.requested_role === 'developer' && req.status === 'pending');

  const handleRequestDeveloper = () => {
    createRoleRequest.mutate({
      requested_role: 'developer',
      reason: requestReason || undefined
    });
    setShowRequestForm(false);
    setRequestReason('');
  };

  if (!user || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p>로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">프로필</h1>
        
        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-muted-foreground">
                  {profile.username?.charAt(0).toUpperCase() || ''}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-card-foreground">{profile.username}</h2>
              <p className="text-muted-foreground capitalize">{profile.role}</p>
              {profile.bio && (
                <p className="text-card-foreground mt-1">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* 역할 요청 섹션 */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground">역할 관리</h3>
          
          {profile.role === 'user' && (
            <div className="mb-6">
              {canRequestDeveloper && !showRequestForm && (
                <Button
                  onClick={() => setShowRequestForm(true)}
                  className="mb-4"
                >
                  개발자 권한 요청
                </Button>
              )}

              {showRequestForm && (
                <div className="border rounded-lg p-4 mb-4">
                  <h4 className="font-medium mb-3 text-card-foreground">개발자 권한 요청</h4>
                  <textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="요청 사유를 입력해주세요 (선택사항)"
                    className="w-full p-2 border border-input bg-background text-foreground rounded-md resize-none"
                    rows={3}
                  />
                  <div className="flex space-x-2 mt-3">
                    <Button
                      onClick={handleRequestDeveloper}
                      disabled={createRoleRequest.isPending}
                    >
                      {createRoleRequest.isPending ? '요청 중...' : '요청하기'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowRequestForm(false);
                        setRequestReason('');
                      }}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}

              {!canRequestDeveloper && (
                <p className="text-muted-foreground">
                  이미 개발자 권한 요청이 진행 중입니다.
                </p>
              )}
            </div>
          )}

          {/* 요청 히스토리 */}
          {roleRequests && roleRequests.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 text-card-foreground">요청 히스토리</h4>
              <div className="space-y-2">
                {roleRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex justify-between items-center p-3 border rounded-lg bg-background"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {request.requested_role === 'developer' ? '개발자' : '관리자'} 권한 요청
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.reason && (
                        <p className="text-sm text-foreground mt-1">{request.reason}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {request.status === 'pending'
                          ? '대기중'
                          : request.status === 'approved'
                          ? '승인됨'
                          : '거절됨'}
                      </span>
                      {request.admin_notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          관리자 메모: {request.admin_notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}