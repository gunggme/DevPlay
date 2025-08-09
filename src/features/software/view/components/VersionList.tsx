import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { useVersionsBySoftware, useDeleteVersion } from '@/shared/hooks/useVersions';
import { useAppSelector } from '@/store/hooks';
import { VersionFormModal } from './VersionFormModal';
import type { SoftwareVersion } from '@/shared/api/versions';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/shared/utils/cn';

interface VersionListProps {
  softwareId: string;
  developerId: string;
  className?: string;
}

export function VersionList({ softwareId, developerId, className }: VersionListProps) {
  const { profile } = useAppSelector((state) => state.auth);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<SoftwareVersion | undefined>();
  
  const { data: versions, isLoading, error } = useVersionsBySoftware(softwareId);
  const deleteVersion = useDeleteVersion();

  const isOwner = profile?.id === developerId;
  const isDeveloper = profile?.role === 'developer' || profile?.role === 'admin';
  const canManageVersions = isOwner && isDeveloper;

  const handleEdit = (version: SoftwareVersion) => {
    setEditingVersion(version);
    setShowFormModal(true);
  };

  const handleDelete = async (version: SoftwareVersion) => {
    if (window.confirm(`"${version.version}" 버전을 삭제하시겠습니까?`)) {
      try {
        await deleteVersion.mutateAsync(version.id);
      } catch (error) {
        console.error('Failed to delete version:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingVersion(undefined);
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ko
    });
  };

  const formatReleaseDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <p className="mb-4 text-destructive">
          버전 정보를 불러오는 데 실패했습니다.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 헤더 */}
      {canManageVersions && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-card-foreground">
            버전 히스토리 ({versions?.length || 0})
          </h3>
          <Button 
            onClick={() => setShowFormModal(true)}
            className="flex items-center space-x-2"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>새 버전 등록</span>
          </Button>
        </div>
      )}

      {/* 버전 목록 */}
      {!versions || versions.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <svg className="size-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-card-foreground">
            등록된 버전이 없습니다
          </h3>
          <p className="mb-4 text-muted-foreground">
            {canManageVersions 
              ? '첫 번째 버전을 등록해보세요!' 
              : '개발자가 버전을 등록하면 여기에 표시됩니다.'}
          </p>
          {canManageVersions && (
            <Button 
              onClick={() => setShowFormModal(true)}
              className="flex items-center space-x-2"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>버전 등록</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div key={version.id} className="rounded-lg border bg-card">
              {/* 버전 헤더 */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-primary">
                      {version.version}
                    </span>
                    {index === 0 && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        최신
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatReleaseDate(version.release_date)}
                    <span className="mx-1">•</span>
                    {formatDate(version.created_at)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => window.open(version.download_url, '_blank')}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>다운로드</span>
                  </Button>
                  
                  {canManageVersions && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(version)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(version)}
                        className="text-destructive hover:text-destructive"
                        disabled={deleteVersion.isPending}
                      >
                        삭제
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 변경 내역 */}
              {version.changelog && (
                <div className="p-4">
                  <h4 className="mb-2 font-medium text-card-foreground">변경 내역</h4>
                  <div className="prose max-w-none text-sm text-muted-foreground">
                    <pre className="whitespace-pre-wrap font-sans">
                      {version.changelog}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 버전 폼 모달 */}
      <VersionFormModal
        isOpen={showFormModal}
        onClose={handleCloseModal}
        softwareId={softwareId}
        version={editingVersion}
      />
    </div>
  );
}