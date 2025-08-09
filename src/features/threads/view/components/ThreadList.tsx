import React, { useState } from 'react';
import { useThreads } from '@/shared/hooks/useThreads';
import { Button } from '@/shared/ui/Button';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ThreadCard } from './ThreadCard';
import { CreateThreadModal } from './CreateThreadModal';
import { cn } from '@/shared/utils/cn';

interface ThreadListProps {
  softwareId?: string;
  authorId?: string;
  className?: string;
}

export function ThreadList({ softwareId, authorId, className }: ThreadListProps) {
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { data: threads, isLoading, error, refetch } = useThreads({
    sort,
    software_id: softwareId,
    author_id: authorId,
    limit: 20
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-destructive">
          스레드를 불러오는 데 실패했습니다.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={sort === 'latest' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSort('latest')}
          >
            최신순
          </Button>
          <Button
            variant={sort === 'popular' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSort('popular')}
          >
            인기순
          </Button>
        </div>
        
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>스레드 작성</span>
        </Button>
      </div>

      {/* Thread List */}
      {!threads || threads.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <svg className="size-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-card-foreground">
            아직 스레드가 없습니다
          </h3>
          <p className="mb-4 text-muted-foreground">
            첫 번째 스레드를 작성해보세요!
          </p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>스레드 작성</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <ThreadCard 
              key={thread.id} 
              thread={thread}
              showSoftware={!softwareId}
            />
          ))}
        </div>
      )}

      {/* Create Thread Modal */}
      <CreateThreadModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        defaultSoftwareId={softwareId}
      />
    </div>
  );
}