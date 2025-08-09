import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useThread, useComments } from '@/shared/hooks/useThreads';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { Button } from '@/shared/ui/Button';
import { ThreadCard } from './ThreadCard';
import { CommentThread } from './CommentThread';

export function ThreadDetailPage() {
  const { threadId } = useParams<{ threadId: string }>();
  
  const { data: thread, isLoading: threadLoading, error: threadError } = useThread(threadId!);
  const { data: comments, isLoading: commentsLoading, error: commentsError } = useComments(threadId!);

  if (threadLoading || commentsLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (threadError || commentsError || !thread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-card-foreground">
            스레드를 찾을 수 없습니다
          </h2>
          <p className="mb-6 text-muted-foreground">
            요청하신 스레드가 존재하지 않거나 삭제되었습니다.
          </p>
          <Link to="/threads">
            <Button variant="outline">
              스레드 목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Back Button */}
        <div>
          <Link to="/threads">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>스레드 목록</span>
            </Button>
          </Link>
        </div>

        {/* Thread */}
        <ThreadCard thread={thread} className="shadow-sm" />

        {/* Comments */}
        <div className="border-t border-border pt-6">
          <h3 className="mb-6 text-lg font-semibold text-card-foreground">
            댓글 {comments?.length || 0}개
          </h3>
          <CommentThread 
            threadId={thread.id} 
            comments={comments || []}
          />
        </div>
      </div>
    </div>
  );
}