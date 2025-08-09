import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSoftware } from '@/shared/hooks/useSoftware';
import { useThreads } from '@/shared/hooks/useThreads';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/shared/ui/Button';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ThreadCard } from '@/features/threads/view/components';
import { SoftwareFormModal } from './SoftwareFormModal';
import { VersionList } from './components/VersionList';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/shared/utils/cn';

export function SoftwareDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAppSelector((state) => state.auth);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'threads'>('overview');
  
  const { data: software, isLoading: softwareLoading, error: softwareError } = useSoftware(id!);
  const { data: relatedThreads, isLoading: threadsLoading } = useThreads({
    software_id: id,
    limit: 10
  });

  if (softwareLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (softwareError || !software) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <h2 className="mb-4 text-2xl font-bold text-card-foreground">
            소프트웨어를 찾을 수 없습니다
          </h2>
          <p className="mb-6 text-muted-foreground">
            요청하신 소프트웨어가 존재하지 않거나 삭제되었습니다.
          </p>
          <Link to="/software">
            <Button variant="outline">
              소프트웨어 목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = profile?.id === software.developer_id;
  const isDeveloper = profile?.role === 'developer' || profile?.role === 'admin';

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ko
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link to="/software">
              <Button variant="ghost" size="sm" className="mb-4 flex items-center space-x-2">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>소프트웨어 목록</span>
              </Button>
            </Link>
            
            <div className="mb-2 flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-foreground">
                {software.name}
              </h1>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {software.category}
              </span>
            </div>
            
            <p className="mb-4 text-muted-foreground">
              {software.description}
            </p>
            
            {/* Developer Info */}
            <div className="mb-4 flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex size-6 items-center justify-center rounded-full bg-muted">
                {software.profiles?.avatar_url ? (
                  <img
                    src={software.profiles.avatar_url}
                    alt={software.profiles.username}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground">
                    {software.profiles?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span>
                by {software.profiles?.username}
              </span>
              <span>•</span>
              <span>{formatDate(software.created_at)}</span>
            </div>
            
            {/* Tags */}
            {software.tags && software.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {software.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2 py-1 text-sm text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={() => window.open(software.download_url, '_blank')}
              className="flex items-center space-x-2"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>다운로드</span>
            </Button>
            
            {software.github_url && (
              <Button
                variant="outline"
                onClick={() => window.open(software.github_url, '_blank')}
                className="flex items-center space-x-2"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </Button>
            )}
            
            {isOwner && (
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
              >
                수정
              </Button>
            )}
          </div>
        </div>

        {/* Hero Image */}
        {software.image_url && (
          <div className="overflow-hidden rounded-xl border">
            <img
              src={software.image_url}
              alt={software.name}
              className="h-96 w-full object-cover"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              개요
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={cn(
                'py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'versions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              버전 히스토리
            </button>
            <button
              onClick={() => setActiveTab('threads')}
              className={cn(
                'py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'threads'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              관련 스레드 ({relatedThreads?.length || 0})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="prose max-w-none">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">소프트웨어 정보</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-1 text-sm font-medium text-muted-foreground">설명</h4>
                    <p className="whitespace-pre-wrap">{software.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-muted-foreground">카테고리</h4>
                      <p>{software.category}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-muted-foreground">개발자</h4>
                      <p>{software.profiles?.username}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-muted-foreground">등록일</h4>
                      <p>{new Date(software.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-muted-foreground">마지막 업데이트</h4>
                      <p>{new Date(software.updated_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <Button
                      onClick={() => window.open(software.download_url, '_blank')}
                      className="flex items-center space-x-2"
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>다운로드</span>
                    </Button>
                    
                    {software.github_url && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(software.github_url, '_blank')}
                        className="flex items-center space-x-2"
                      >
                        <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        <span>GitHub 보기</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <VersionList 
              softwareId={software.id}
              developerId={software.developer_id}
            />
          )}

          {activeTab === 'threads' && (
            <div className="space-y-4">
              {threadsLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : !relatedThreads || relatedThreads.length === 0 ? (
                <div className="rounded-lg border bg-card p-8 text-center">
                  <svg className="mx-auto mb-4 size-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mb-2 text-lg font-medium">관련 스레드가 없습니다</h3>
                  <p className="mb-4 text-muted-foreground">이 소프트웨어에 대한 첫 번째 스레드를 작성해보세요!</p>
                  <Link to="/threads">
                    <Button>스레드 작성</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {relatedThreads.map((thread) => (
                    <ThreadCard 
                      key={thread.id} 
                      thread={thread}
                      showSoftware={false}
                    />
                  ))}
                  
                  {relatedThreads.length >= 10 && (
                    <div className="pt-4 text-center">
                      <Link to={`/threads?software=${software.id}`}>
                        <Button variant="outline">모든 관련 스레드 보기</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <SoftwareFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          software={software}
        />
      </div>
    </div>
  );
}