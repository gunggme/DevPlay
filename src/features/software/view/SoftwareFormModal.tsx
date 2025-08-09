import { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { useCreateSoftware, useUpdateSoftware, useCategories, usePopularTags } from '@/shared/hooks/useSoftware';
import type { Software, CreateSoftwareData } from '@/shared/api/software';

interface SoftwareFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  software?: Software;
}

export function SoftwareFormModal({ isOpen, onClose, software }: SoftwareFormModalProps) {
  const createSoftware = useCreateSoftware();
  const updateSoftware = useUpdateSoftware();
  const { data: categories } = useCategories();
  const { data: popularTags } = usePopularTags();

  const [formData, setFormData] = useState<CreateSoftwareData>({
    name: '',
    description: '',
    category: '',
    tags: [],
    image_url: '',
    download_url: '',
    github_url: ''
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (software) {
      setFormData({
        name: software.name,
        description: software.description,
        category: software.category,
        tags: software.tags || [],
        image_url: software.image_url || '',
        download_url: software.download_url,
        github_url: software.github_url || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        tags: [],
        image_url: '',
        download_url: '',
        github_url: ''
      });
    }
  }, [software, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (software) {
        await updateSoftware.mutateAsync({ 
          id: software.id, 
          updates: formData 
        });
      } else {
        await createSoftware.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handlePopularTagClick = (tag: string) => {
    if (!formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
    }
  };

  const isSubmitting = createSoftware.isPending || updateSoftware.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={software ? '소프트웨어 수정' : '소프트웨어 등록'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
            소프트웨어 이름 *
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-md border border-input bg-background p-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary"
            placeholder="소프트웨어 이름을 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-foreground">
            설명 *
          </label>
          <textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full rounded-md border border-input bg-background p-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary"
            rows={3}
            placeholder="소프트웨어에 대한 설명을 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-foreground">
            카테고리 *
          </label>
          <select
            id="category"
            required
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full rounded-md border border-input bg-background p-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary"
          >
            <option value="">카테고리를 선택하세요</option>
            <option value="개발도구">개발도구</option>
            <option value="유틸리티">유틸리티</option>
            <option value="게임">게임</option>
            <option value="미디어">미디어</option>
            <option value="오피스">오피스</option>
            <option value="시스템">시스템</option>
            <option value="보안">보안</option>
            <option value="기타">기타</option>
            {categories?.map(cat => (
              !['개발도구', '유틸리티', '게임', '미디어', '오피스', '시스템', '보안', '기타'].includes(cat) && (
                <option key={cat} value={cat}>{cat}</option>
              )
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="download_url" className="mb-1 block text-sm font-medium text-foreground">
            다운로드 URL *
          </label>
          <input
            type="url"
            id="download_url"
            required
            value={formData.download_url}
            onChange={(e) => setFormData(prev => ({ ...prev, download_url: e.target.value }))}
            className="w-full rounded-md border border-input bg-background p-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary"
            placeholder="https://example.com/download"
          />
        </div>

        <div>
          <label htmlFor="github_url" className="mb-1 block text-sm font-medium text-foreground">
            GitHub URL (선택사항)
          </label>
          <input
            type="url"
            id="github_url"
            value={formData.github_url}
            onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
            className="w-full rounded-md border border-input bg-background p-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary"
            placeholder="https://github.com/username/repo"
          />
        </div>

        <div>
          <label htmlFor="image_url" className="mb-1 block text-sm font-medium text-foreground">
            이미지 URL (선택사항)
          </label>
          <input
            type="url"
            id="image_url"
            value={formData.image_url}
            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
            className="w-full rounded-md border border-input bg-background p-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary"
            placeholder="https://example.com/image.png"
          />
        </div>

        {/* 태그 입력 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            태그 (선택사항)
          </label>
          <div className="mb-2 flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 rounded-md border border-input bg-background p-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary"
              placeholder="태그를 입력하세요"
            />
            <Button
              type="button"
              onClick={handleAddTag}
              variant="secondary"
              size="sm"
            >
              추가
            </Button>
          </div>

          {/* 현재 태그 */}
          {formData.tags && formData.tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-sm text-primary"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-primary hover:text-primary/80"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 인기 태그 */}
          {popularTags && popularTags.length > 0 && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">인기 태그:</p>
              <div className="flex flex-wrap gap-1">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handlePopularTagClick(tag)}
                    className={`rounded px-2 py-1 text-xs transition-colors ${
                      formData.tags?.includes(tag)
                        ? 'cursor-not-allowed bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    disabled={formData.tags?.includes(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2 border-t pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting 
              ? (software ? '수정 중...' : '등록 중...') 
              : (software ? '수정하기' : '등록하기')
            }
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            취소
          </Button>
        </div>
      </form>
    </Modal>
  );
}