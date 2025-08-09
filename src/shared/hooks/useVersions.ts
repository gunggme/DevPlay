import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { versionsApi, type SoftwareVersion, type CreateVersionData, type UpdateVersionData } from '../api/versions';
import { toast } from 'react-hot-toast';

const QUERY_KEYS = {
  versions: 'versions',
  softwareVersions: 'softwareVersions',
  version: 'version',
  latestVersion: 'latestVersion'
} as const;

export function useCreateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: versionsApi.createVersion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.softwareVersions, data.software_id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.latestVersion, data.software_id] });
      toast.success('버전이 등록되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '버전 등록에 실패했습니다');
    }
  });
}

export function useVersionsBySoftware(softwareId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.softwareVersions, softwareId],
    queryFn: () => versionsApi.getVersionsBySoftware(softwareId),
    enabled: !!softwareId,
    staleTime: 5 * 60 * 1000 // 5분
  });
}

export function useVersion(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.version, id],
    queryFn: () => versionsApi.getVersion(id),
    enabled: !!id
  });
}

export function useUpdateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateVersionData }) =>
      versionsApi.updateVersion(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.version, data.id], data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.softwareVersions, data.software_id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.latestVersion, data.software_id] });
      toast.success('버전이 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '버전 수정에 실패했습니다');
    }
  });
}

export function useDeleteVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: versionsApi.deleteVersion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.versions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.softwareVersions] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.latestVersion] });
      toast.success('버전이 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '버전 삭제에 실패했습니다');
    }
  });
}

export function useLatestVersion(softwareId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.latestVersion, softwareId],
    queryFn: () => versionsApi.getLatestVersion(softwareId),
    enabled: !!softwareId,
    staleTime: 5 * 60 * 1000 // 5분
  });
}