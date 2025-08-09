import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { softwareApi, type Software, type CreateSoftwareData, type UpdateSoftwareData } from '../api/software';
import { toast } from 'react-hot-toast';

const QUERY_KEYS = {
  software: 'software',
  softwareList: 'softwareList',
  mySoftware: 'mySoftware',
  categories: 'categories',
  popularTags: 'popularTags'
} as const;

export function useCreateSoftware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: softwareApi.createSoftware,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.softwareList] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.mySoftware] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.popularTags] });
      toast.success('소프트웨어가 등록되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '소프트웨어 등록에 실패했습니다');
    }
  });
}

export function useSoftwareList(filters?: {
  category?: string;
  tags?: string[];
  search?: string;
  developer_id?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.softwareList, filters],
    queryFn: () => softwareApi.getSoftwareList(filters),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useSoftware(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.software, id],
    queryFn: () => softwareApi.getSoftwareById(id),
    enabled: !!id
  });
}

export function useUpdateSoftware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateSoftwareData }) =>
      softwareApi.updateSoftware(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.software, data.id], data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.softwareList] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.mySoftware] });
      toast.success('소프트웨어가 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '소프트웨어 수정에 실패했습니다');
    }
  });
}

export function useArchiveSoftware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: softwareApi.archiveSoftware,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.softwareList] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.mySoftware] });
      toast.success('소프트웨어가 아카이브되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '아카이브에 실패했습니다');
    }
  });
}

export function useDeleteSoftware() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: softwareApi.deleteSoftware,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.softwareList] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.mySoftware] });
      toast.success('소프트웨어가 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '삭제에 실패했습니다');
    }
  });
}

export function useMySoftware() {
  return useQuery({
    queryKey: [QUERY_KEYS.mySoftware],
    queryFn: softwareApi.getMySoftware
  });
}

export function useCategories() {
  return useQuery({
    queryKey: [QUERY_KEYS.categories],
    queryFn: softwareApi.getCategories,
    staleTime: 10 * 60 * 1000, // 10분
  });
}

export function usePopularTags(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.popularTags, limit],
    queryFn: () => softwareApi.getPopularTags(limit),
    staleTime: 10 * 60 * 1000, // 10분
  });
}