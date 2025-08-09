import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { useMySoftware } from '@/shared/hooks/useSoftware';
import { useCreateThread } from '@/shared/hooks/useThreads';
import { cn } from '@/shared/utils/cn';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSoftwareId?: string;
}

export function CreateThreadModal({ isOpen, onClose, defaultSoftwareId }: CreateThreadModalProps) {
  const [content, setContent] = useState('');
  const [selectedSoftwareId, setSelectedSoftwareId] = useState(defaultSoftwareId || '');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  
  const { data: mySoftware } = useMySoftware();
  const createThread = useCreateThread();

  useEffect(() => {
    if (defaultSoftwareId) {
      setSelectedSoftwareId(defaultSoftwareId);
    }
  }, [defaultSoftwareId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    if (content.length > 500) {
      alert('내용은 500자 이하로 입력해주세요.');
      return;
    }

    try {
      await createThread.mutateAsync({
        content: content.trim(),
        software_id: selectedSoftwareId || undefined,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined
      });
      
      // Reset form
      setContent('');
      setSelectedSoftwareId(defaultSoftwareId || '');
      setMediaUrls([]);
      onClose();
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  const handleClose = () => {
    setContent('');
    setSelectedSoftwareId(defaultSoftwareId || '');
    setMediaUrls([]);
    onClose();
  };

  const addMediaUrl = () => {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url && url.trim() && mediaUrls.length < 4) {
      setMediaUrls([...mediaUrls, url.trim()]);
    }
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const remainingChars = 500 - content.length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="스레드 작성" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Software Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            소프트웨어 (선택사항)
          </label>
          <select
            value={selectedSoftwareId}
            onChange={(e) => setSelectedSoftwareId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={!!defaultSoftwareId}
          >
            <option value="">소프트웨어 선택 안함</option>
            {mySoftware?.map((software) => (
              <option key={software.id} value={software.id}>
                {software.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            내용 *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="무엇을 공유하고 싶으신가요?"
            rows={6}
            maxLength={500}
            required
            className={cn(
              'w-full px-3 py-2 border border-input rounded-md bg-background text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring resize-none',
              remainingChars < 0 && 'border-destructive focus:ring-destructive'
            )}
          />
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              최대 500자, 이미지 최대 4개
            </span>
            <span className={cn(
              'font-medium',
              remainingChars < 0 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {remainingChars}자 남음
            </span>
          </div>
        </div>

        {/* Media URLs */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-foreground">
              이미지 ({mediaUrls.length}/4)
            </label>
            {mediaUrls.length < 4 && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addMediaUrl}
              >
                이미지 추가
              </Button>
            )}
          </div>
          
          {mediaUrls.length > 0 && (
            <div className="space-y-2">
              {mediaUrls.map((url, index) => (
                <div key={index} className="flex items-center space-x-2 rounded-md bg-muted p-2">
                  <img 
                    src={url} 
                    alt={`미리보기 ${index + 1}`}
                    className="size-12 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21,15 16,10 5,21"%3E%3C/polyline%3E%3C/svg%3E';
                    }}
                  />
                  <span className="flex-1 truncate text-sm text-muted-foreground">
                    {url}
                  </span>
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMediaUrl(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    삭제
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 border-t border-border pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={createThread.isPending}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            disabled={createThread.isPending || !content.trim() || remainingChars < 0}
            isLoading={createThread.isPending}
          >
            게시
          </Button>
        </div>
      </form>
    </Modal>
  );
}