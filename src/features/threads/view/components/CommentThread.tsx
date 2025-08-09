import React, { useState } from 'react';
import type { Comment } from '@/shared/api/threads';
import { Button } from '@/shared/ui/Button';
import { useCreateComment, useUpdateComment, useDeleteComment } from '@/shared/hooks/useThreads';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/shared/utils/cn';

interface CommentThreadProps {
  threadId: string;
  comments: Comment[];
  depth?: number;
  className?: string;
}

interface CommentItemProps {
  comment: Comment;
  threadId: string;
  depth: number;
  onReply: (parentId: string) => void;
}

function CommentItem({ comment, threadId, depth, onReply }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: ko 
    });
  };

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }

    try {
      await updateComment.mutateAsync({ id: comment.id, content: editContent.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await deleteComment.mutateAsync(comment.id);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  return (
    <div className={cn(
      'border-l-2 border-border pl-4',
      depth > 0 && 'ml-4'
    )}>
      <div className="rounded-lg border border-border bg-card p-4">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-semibold text-primary">
                {comment.author_profile?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-card-foreground">
                  {comment.author_profile?.username}
                </span>
                {comment.author_profile?.role === 'developer' && (
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    개발자
                  </span>
                )}
                {comment.author_profile?.role === 'admin' && (
                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                    관리자
                  </span>
                )}
                {comment.is_edited && (
                  <span className="text-xs text-muted-foreground">(수정됨)</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                maxLength={300}
                className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={updateComment.isPending}
                >
                  취소
                </Button>
                <Button 
                  size="sm"
                  onClick={handleEdit}
                  disabled={updateComment.isPending || !editContent.trim()}
                  isLoading={updateComment.isPending}
                >
                  수정
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm text-card-foreground">
              {comment.is_deleted ? (
                <span className="italic text-muted-foreground">{comment.content}</span>
              ) : (
                comment.content
              )}
            </p>
          )}
        </div>

        {/* Actions */}
        {!comment.is_deleted && (
          <div className="flex items-center space-x-2 text-xs">
            {depth < 3 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onReply(comment.id)}
                className="h-6 px-2 text-xs"
              >
                답글
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-6 px-2 text-xs"
            >
              수정
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDelete}
              className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              disabled={deleteComment.isPending}
            >
              삭제
            </Button>
          </div>
        )}
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              threadId={threadId}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentForm({ threadId, parentId, onCancel }: { threadId: string; parentId?: string; onCancel?: () => void }) {
  const [content, setContent] = useState('');
  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    try {
      await createComment.mutateAsync({
        thread_id: threadId,
        content: content.trim(),
        parent_id: parentId
      });
      
      setContent('');
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const remainingChars = 300 - content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 작성해주세요..."
        rows={3}
        maxLength={300}
        required
        className={cn(
          'w-full px-3 py-2 border border-input rounded-md bg-background text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm',
          remainingChars < 0 && 'border-destructive focus:ring-destructive'
        )}
      />
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-xs',
          remainingChars < 0 ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {remainingChars}자 남음
        </span>
        <div className="flex space-x-2">
          {onCancel && (
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={onCancel}
              disabled={createComment.isPending}
            >
              취소
            </Button>
          )}
          <Button 
            type="submit"
            size="sm"
            disabled={createComment.isPending || !content.trim() || remainingChars < 0}
            isLoading={createComment.isPending}
          >
            댓글 작성
          </Button>
        </div>
      </div>
    </form>
  );
}

export function CommentThread({ threadId, comments, depth = 0, className }: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showNewCommentForm, setShowNewCommentForm] = useState(false);

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    setShowNewCommentForm(false);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* New Comment Form */}
      {depth === 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          {showNewCommentForm ? (
            <CommentForm 
              threadId={threadId}
              onCancel={() => setShowNewCommentForm(false)}
            />
          ) : (
            <Button 
              variant="outline"
              onClick={() => setShowNewCommentForm(true)}
              className="w-full justify-start text-muted-foreground"
            >
              댓글을 작성해주세요...
            </Button>
          )}
        </div>
      )}

      {/* Comments */}
      {comments.length === 0 && depth === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>첫 번째 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                threadId={threadId}
                depth={depth}
                onReply={handleReply}
              />
              
              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="ml-8 mt-3">
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <CommentForm 
                      threadId={threadId}
                      parentId={comment.id}
                      onCancel={handleCancelReply}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}