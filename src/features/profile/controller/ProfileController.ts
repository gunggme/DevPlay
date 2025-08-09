import { useAppSelector } from '@/store';
import { useCreateRoleRequest, useUserRoleRequests } from '@/shared/hooks/useRoleRequests';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';
import { useEffect } from 'react';

export function useProfileController() {
  const { user, profile } = useAppSelector((state) => state.auth);
  const { data: roleRequests, isLoading: isLoadingRoleRequests, error: roleRequestsError } = useUserRoleRequests();
  const createRoleRequest = useCreateRoleRequest();
  const { handleApiError, showSuccess } = useErrorHandler();

  const canRequestDeveloper = profile?.role === 'user' && 
    !roleRequests?.some(req => req.requested_role === 'developer' && req.status === 'pending');

  const handleRequestDeveloper = (reason: string) => {
    createRoleRequest.mutate({
      requested_role: 'developer',
      reason: reason || undefined
    }, {
      onSuccess: () => {
        showSuccess('개발자 권한 요청이 성공적으로 제출되었습니다.');
      },
      onError: (error) => {
        handleApiError(error, '권한 요청');
      }
    });
  };

  useEffect(() => {
    if (roleRequestsError) {
      handleApiError(roleRequestsError, '역할 요청 조회');
    }
  }, [roleRequestsError, handleApiError]);

  const isAuthenticated = !!user && !!profile;
  
  return {
    user,
    profile,
    roleRequests,
    isLoadingRoleRequests,
    roleRequestsError,
    canRequestDeveloper,
    isAuthenticated,
    handleRequestDeveloper,
    isCreatingRequest: createRoleRequest.isPending,
    createRequestError: createRoleRequest.error
  };
}