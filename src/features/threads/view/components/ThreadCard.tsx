import React from 'react';
import { Link } from 'react-router-dom';
import type { Thread } from '@/shared/api/threads';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';
import { useToggleThreadReaction } from '@/shared/hooks/useThreads';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ThreadCardProps {
  thread: Thread;
  className?: string;
  showSoftware?: boolean;
}

const reactionConfig = {
  like: { icon: '👍', label: '좋아요' },
  cheer: { icon: '🎉', label: '응원' }, 
  bug: { icon: '🐛', label: '버그' },
  suggestion: { icon: '💡', label: '제안' }
};

export function ThreadCard({ thread, className, showSoftware = true }: ThreadCardProps) {
  const toggleReaction = useToggleThreadReaction();

  const handleReaction = (type: 'like' | 'cheer' | 'bug' | 'suggestion') => {
    toggleReaction.mutate({ threadId: thread.id, type });
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ko 
    });
  };

  return (
    <article 
      className={cn(
        'border border-border rounded-lg bg-card p-6 space-y-4 hover:shadow-md transition-shadow',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
            <span className="text-sm font-semibold text-primary">
              {thread.author_profile?.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-card-foreground">
                {thread.author_profile?.username}
              </span>
              {thread.author_profile?.role === 'developer' && (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  개발자
                </span>
              )}
              {thread.author_profile?.role === 'admin' && (
                <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                  관리자
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(thread.created_at)}
            </p>
          </div>
        </div>
        
        {showSoftware && thread.software && (
          <Link 
            to={`/software/${thread.software.id}`}
            className="text-sm text-primary hover:underline"
          >
            {thread.software.name}
          </Link>
        )}
      </div>

      {/* Content */}
      <div>
        <p className="whitespace-pre-wrap break-words text-card-foreground">
          {thread.content}
        </p>
        
        {thread.media_urls && thread.media_urls.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {thread.media_urls.slice(0, 4).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`첨부 이미지 ${index + 1}`}
                className="h-32 w-full rounded-lg bg-muted object-cover"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-2">
        <div className="flex items-center space-x-2">
          {Object.entries(reactionConfig).map(([type, config]) => {
            const count = thread.reactions?.[type as keyof typeof thread.reactions] || 0;
            const isActive = thread.user_reaction === type;
            
            return (
              <Button
                key={type}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleReaction(type as 'like' | 'cheer' | 'bug' | 'suggestion')}
                disabled={toggleReaction.isPending}
                className={cn(
                  'text-xs space-x-1 h-8',
                  isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
                )}
              >
                <span>{config.icon}</span>
                <span>{count > 0 ? count : ''}</span>
              </Button>
            );
          })}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <Link 
            to={`/threads/${thread.id}`}
            className="flex items-center space-x-1 transition-colors hover:text-foreground"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>
              {thread.comments_count === 0 ? '댓글' : `댓글 ${thread.comments_count}`}
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}