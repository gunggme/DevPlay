import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleRequestsApi, type RoleRequest } from '../api/roleRequests';
import { toast } from 'react-hot-toast';

const QUERY_KEYS = {
  roleRequests: 'roleRequests',
  userRoleRequests: 'userRoleRequests',
  pendingRoleRequests: 'pendingRoleRequests'
} as const;

export function useCreateRoleRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roleRequestsApi.createRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.userRoleRequests] });
      toast.success('역할 승인 요청이 전송되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '요청 전송에 실패했습니다');
    }
  });
}

export function useUserRoleRequests() {
  return useQuery({
    queryKey: [QUERY_KEYS.userRoleRequests],
    queryFn: roleRequestsApi.getUserRoleRequests
  });
}

export function usePendingRoleRequests() {
  return useQuery({
    queryKey: [QUERY_KEYS.pendingRoleRequests],
    queryFn: roleRequestsApi.getPendingRoleRequests,
    refetchInterval: 30000
  });
}

export function useAllRoleRequests() {
  return useQuery({
    queryKey: [QUERY_KEYS.roleRequests],
    queryFn: roleRequestsApi.getAllRoleRequests
  });
}

export function useApproveRoleRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, adminNotes }: { requestId: string; adminNotes?: string }) =>
      roleRequestsApi.approveRoleRequest(requestId, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.roleRequests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingRoleRequests] });
      toast.success('역할 요청을 승인했습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '승인 처리에 실패했습니다');
    }
  });
}

export function useRejectRoleRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, adminNotes }: { requestId: string; adminNotes?: string }) =>
      roleRequestsApi.rejectRoleRequest(requestId, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.roleRequests] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.pendingRoleRequests] });
      toast.success('역할 요청을 거절했습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '거절 처리에 실패했습니다');
    }
  });
}

export function useCancelRoleRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roleRequestsApi.cancelRoleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.userRoleRequests] });
      toast.success('요청을 취소했습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '취소에 실패했습니다');
    }
  });
}