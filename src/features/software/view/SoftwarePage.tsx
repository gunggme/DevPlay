import { useSoftwareList, useArchiveSoftware, useDeleteSoftware, useCategories } from '@/shared/hooks/useSoftware';
import { Button } from '@/shared/ui/Button';
import { SoftwareFormModal } from './SoftwareFormModal';
import type { Software } from '@/shared/api/software';
import { useAppSelector } from '@/store/hooks';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';

export function SoftwarePage() {
  const { profile } = useAppSelector((state) => state.auth);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<Software | undefined>();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  const { data: softwareList, isLoading } = useSoftwareList(filters);
  const { data: categories } = useCategories();
  const archiveSoftware = useArchiveSoftware();
  const deleteSoftware = useDeleteSoftware();

  const isDeveloper = profile?.role === 'developer' || profile?.role === 'admin';

  const handleEdit = (software: Software) => {
    setEditingSoftware(software);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingSoftware(undefined);
  };

  const handleArchive = async (id: string) => {
    if (confirm('이 소프트웨어를 아카이브하시겠습니까?')) {
      archiveSoftware.mutate(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('이 소프트웨어를 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteSoftware.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-3xl font-bold">소프트웨어</h1>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">소프트웨어</h1>
          {isDeveloper && (
            <Button onClick={() => setIsFormModalOpen(true)}>
              소프트웨어 등록
            </Button>
          )}
        </div>

        {/* 필터 섹션 */}
        <div className="mb-6 rounded-lg border bg-card p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                카테고리
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-md border bg-background p-2 text-foreground"
              >
                <option value="">전체 카테고리</option>
                {categories?.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                검색
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="소프트웨어 이름 또는 설명 검색"
                className="w-full rounded-md border bg-background p-2 text-foreground"
              />
              {searchInput !== debouncedSearch && (
                <p className="mt-1 text-xs text-muted-foreground">검색 중...</p>
              )}
            </div>
          </div>
        </div>

        {/* 소프트웨어 목록 */}
        {!softwareList || softwareList.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">등록된 소프트웨어가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {softwareList.map((software) => (
              <div key={software.id} className="overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg">
                {software.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={software.image_url}
                      alt={software.name}
                      className="size-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{software.name}</h3>
                    <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {software.category}
                    </span>
                  </div>
                  
                  <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
                    {software.description}
                  </p>
                  
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
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
                      <span className="text-xs text-muted-foreground">
                        {software.profiles?.username}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(software.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {software.tags && software.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {software.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                      {software.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{software.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(software.download_url, '_blank')}
                    >
                      다운로드
                    </Button>
                    
                    {software.github_url && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(software.github_url, '_blank')}
                      >
                        GitHub
                      </Button>
                    )}
                  </div>
                  
                  {/* 개발자용 액션 버튼 */}
                  {isDeveloper && software.developer_id === profile?.id && (
                    <div className="mt-2 flex space-x-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(software)}
                        className="flex-1 text-xs"
                      >
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleArchive(software.id)}
                        className="flex-1 text-xs"
                        disabled={archiveSoftware.isPending}
                      >
                        아카이브
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDelete(software.id)}
                        className="flex-1 text-xs text-destructive hover:bg-destructive/10"
                        disabled={deleteSoftware.isPending}
                      >
                        삭제
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <SoftwareFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModal}
          software={editingSoftware}
        />
      </div>
    </div>
  );
}