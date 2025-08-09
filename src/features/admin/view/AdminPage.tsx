// import { useAppSelector } from '@/app/providers/store';
import { usePendingRoleRequests, useApproveRoleRequest, useRejectRoleRequest } from '@/shared/hooks/useRoleRequests';
import { Button } from '@/shared/ui/Button';
import { useAppSelector } from '@/store';
import { useState } from 'react';

export function AdminPage() {
  const { profile } = useAppSelector((state) => state.auth);
  const { data: pendingRequests, isLoading } = usePendingRoleRequests();
  const approveRequest = useApproveRoleRequest();
  const rejectRequest = useRejectRoleRequest();
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-destructive">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const handleApprove = (requestId: string) => {
    approveRequest.mutate({
      requestId,
      adminNotes: adminNotes[requestId] || undefined
    });
    setAdminNotes(prev => ({ ...prev, [requestId]: '' }));
  };

  const handleReject = (requestId: string) => {
    rejectRequest.mutate({
      requestId,
      adminNotes: adminNotes[requestId] || undefined
    });
    setAdminNotes(prev => ({ ...prev, [requestId]: '' }));
  };

  const updateAdminNotes = (requestId: string, notes: string) => {
    setAdminNotes(prev => ({ ...prev, [requestId]: notes }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>
        
        {/* 역할 요청 승인 섹션 */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">
            대기 중인 역할 요청 ({pendingRequests?.length || 0})
          </h2>
          
          {!pendingRequests || pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">대기 중인 역할 요청이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-background">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          {request.user_profile?.avatar_url ? (
                            <img
                              src={request.user_profile.avatar_url}
                              alt={request.user_profile.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">
                              {request.user_profile?.username?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{request.user_profile?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.current_role} → {request.requested_role}
                          </p>
                        </div>
                      </div>
                      
                      {request.user_profile?.bio && (
                        <p className="text-sm text-foreground mb-2">
                          소개: {request.user_profile.bio}
                        </p>
                      )}
                      
                      {request.reason && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-foreground mb-1">요청 사유:</p>
                          <p className="text-sm text-foreground bg-muted p-2 rounded">
                            {request.reason}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        요청일: {new Date(request.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    
                    <div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          관리자 메모 (선택사항)
                        </label>
                        <textarea
                          value={adminNotes[request.id] || ''}
                          onChange={(e) => updateAdminNotes(request.id, e.target.value)}
                          placeholder="승인/거절 사유나 추가 메모를 입력하세요"
                          className="w-full p-2 border border-input bg-background text-foreground rounded-md resize-none text-sm"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleApprove(request.id)}
                          disabled={approveRequest.isPending || rejectRequest.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {approveRequest.isPending ? '승인 중...' : '승인'}
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          disabled={approveRequest.isPending || rejectRequest.isPending}
                          variant="secondary"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          size="sm"
                        >
                          {rejectRequest.isPending ? '거절 중...' : '거절'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}