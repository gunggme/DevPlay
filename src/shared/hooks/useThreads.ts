import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { threadsApi, type Thread, type CreateThreadData, type CreateCommentData } from '../api/threads';
import { toast } from 'react-hot-toast';

const QUERY_KEYS = {
  threads: 'threads',
  thread: 'thread',
  comments: 'comments'
} as const;

export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: threadsApi.createThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.threads] });
      toast.success('스레드가 작성되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '스레드 작성에 실패했습니다');
    }
  });
}

export function useThreads(options?: {
  sort?: 'latest' | 'popular';
  software_id?: string;
  author_id?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS.threads, options],
    queryFn: () => threadsApi.getThreads(options),
    staleTime: 2 * 60 * 1000, // 2분
  });
}

export function useThread(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.thread, id],
    queryFn: () => threadsApi.getThread(id),
    enabled: !!id
  });
}

export function useUpdateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateThreadData> }) =>
      threadsApi.updateThread(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.thread, data.id], data);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.threads] });
      toast.success('스레드가 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '스레드 수정에 실패했습니다');
    }
  });
}

export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: threadsApi.deleteThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.threads] });
      toast.success('스레드가 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '스레드 삭제에 실패했습니다');
    }
  });
}

export function useComments(threadId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.comments, threadId],
    queryFn: () => threadsApi.getComments(threadId),
    enabled: !!threadId
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: threadsApi.createComment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.comments, data.thread_id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.threads] });
      toast.success('댓글이 작성되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '댓글 작성에 실패했습니다');
    }
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      threadsApi.updateComment(id, content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.comments, data.thread_id] });
      toast.success('댓글이 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '댓글 수정에 실패했습니다');
    }
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: threadsApi.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.comments] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.threads] });
      toast.success('댓글이 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error(error.message || '댓글 삭제에 실패했습니다');
    }
  });
}

export function useToggleThreadReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, type }: { threadId: string; type: 'like' | 'cheer' | 'bug' | 'suggestion' }) =>
      threadsApi.toggleThreadReaction(threadId, type),
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.thread, threadId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.threads] });
    },
    onError: (error: Error) => {
      toast.error(error.message || '반응 처리에 실패했습니다');
    }
  });
}