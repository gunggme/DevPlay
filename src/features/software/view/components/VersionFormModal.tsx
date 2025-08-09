import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { useCreateVersion, useUpdateVersion } from '@/shared/hooks/useVersions';
import type { SoftwareVersion } from '@/shared/api/versions';
import { cn } from '@/shared/utils/cn';

interface VersionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  softwareId: string;
  version?: SoftwareVersion;
}

export function VersionFormModal({ isOpen, onClose, softwareId, version }: VersionFormModalProps) {
  const [formData, setFormData] = useState({
    version: '',
    changelog: '',
    download_url: '',
    release_date: ''
  });
  
  const createVersion = useCreateVersion();
  const updateVersion = useUpdateVersion();
  const isEditing = !!version;

  useEffect(() => {
    if (version) {
      setFormData({
        version: version.version,
        changelog: version.changelog || '',
        download_url: version.download_url,
        release_date: version.release_date.split('T')[0] // YYYY-MM-DD 형식으로 변환
      });
    } else {
      setFormData({
        version: '',
        changelog: '',
        download_url: '',
        release_date: new Date().toISOString().split('T')[0]
      });
    }
  }, [version, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.version.trim() || !formData.download_url.trim()) {
      return;
    }

    try {
      const releaseDate = formData.release_date 
        ? new Date(formData.release_date).toISOString()
        : new Date().toISOString();

      if (isEditing && version) {
        await updateVersion.mutateAsync({
          id: version.id,
          updates: {
            version: formData.version.trim(),
            changelog: formData.changelog.trim() || null,
            download_url: formData.download_url.trim(),
            release_date: releaseDate
          }
        });
      } else {
        await createVersion.mutateAsync({
          software_id: softwareId,
          version: formData.version.trim(),
          changelog: formData.changelog.trim() || undefined,
          download_url: formData.download_url.trim(),
          release_date: releaseDate
        });
      }
      
      handleClose();
    } catch (error) {
      console.error('Failed to save version:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      version: '',
      changelog: '',
      download_url: '',
      release_date: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isPending = createVersion.isPending || updateVersion.isPending;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={isEditing ? '버전 수정' : '새 버전 등록'} 
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 버전 번호 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            버전 번호 *
          </label>
          <input
            type="text"
            value={formData.version}
            onChange={(e) => updateFormData('version', e.target.value)}
            placeholder="v1.0.0, 1.2.3, 2.0.0-beta 등"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            권장 형식: v1.0.0 또는 1.0.0
          </p>
        </div>

        {/* 다운로드 URL */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            다운로드 URL *
          </label>
          <input
            type="url"
            value={formData.download_url}
            onChange={(e) => updateFormData('download_url', e.target.value)}
            placeholder="https://github.com/user/repo/releases/download/v1.0.0/app.zip"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* 릴리즈 날짜 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            릴리즈 날짜
          </label>
          <input
            type="date"
            value={formData.release_date}
            onChange={(e) => updateFormData('release_date', e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* 변경 내역 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            변경 내역 (Changelog)
          </label>
          <textarea
            value={formData.changelog}
            onChange={(e) => updateFormData('changelog', e.target.value)}
            placeholder="이 버전에서의 주요 변경 사항을 마크다운으로 작성하세요...\n\n## 새로운 기능\n- 기능 A 추가\n- 기능 B 개선\n\n## 버그 수정\n- 오류 C 해결"
            rows={8}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            마크다운 문법을 사용할 수 있습니다.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-3 border-t border-border pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isPending}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            disabled={isPending || !formData.version.trim() || !formData.download_url.trim()}
            isLoading={isPending}
          >
            {isEditing ? '수정' : '등록'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}