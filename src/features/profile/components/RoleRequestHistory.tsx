import { StatusBadge } from '@/shared/ui/StatusBadge';
import type { RoleRequest } from '@/shared/api/roleRequests';

interface RoleRequestHistoryProps {
  roleRequests: RoleRequest[];
}

export function RoleRequestHistory({ roleRequests }: RoleRequestHistoryProps) {
  if (!roleRequests?.length) {
    return null;
  }

  return (
    <div>
      <h4 className="mb-3 font-medium text-card-foreground">요청 히스토리</h4>
      <div className="space-y-2">
        {roleRequests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between rounded-lg border bg-background p-3"
          >
            <div>
              <p className="font-medium text-foreground">
                {request.requested_role === 'developer' ? '개발자' : '관리자'} 권한 요청
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(request.created_at).toLocaleDateString()}
              </p>
              {request.reason && (
                <p className="mt-1 text-sm text-foreground">{request.reason}</p>
              )}
            </div>
            <div className="text-right">
              <StatusBadge status={request.status} />
              {request.admin_notes && (
                <p className="mt-1 text-xs text-muted-foreground">
                  관리자 메모: {request.admin_notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}