import { useState } from 'react';
import { useAppSelector } from '@/app/providers/store';
import { useSoftwareList, useArchiveSoftware, useDeleteSoftware, useCategories } from '@/shared/hooks/useSoftware';
import { Button } from '@/shared/ui/Button';
import { SoftwareFormModal } from './SoftwareFormModal';
import type { Software } from '@/shared/api/software';

export function SoftwarePage() {
  const { profile } = useAppSelector((state) => state.auth);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<Software | undefined>();
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });

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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">소프트웨어</h1>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">소프트웨어</h1>
          {isDeveloper && (
            <Button onClick={() => setIsFormModalOpen(true)}>
              소프트웨어 등록
            </Button>
          )}
        </div>

        {/* 필터 섹션 */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">전체 카테고리</option>
                {categories?.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                검색
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="소프트웨어 이름 또는 설명 검색"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* 소프트웨어 목록 */}
        {!softwareList || softwareList.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <p className="text-gray-500">등록된 소프트웨어가 없습니다.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwareList.map((software) => (
              <div key={software.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
                {software.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={software.image_url}
                      alt={software.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{software.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {software.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {software.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        {software.developer_profile?.avatar_url ? (
                          <img
                            src={software.developer_profile.avatar_url}
                            alt={software.developer_profile.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-gray-500">
                            {software.developer_profile?.username?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-600">
                        {software.developer_profile?.username}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(software.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {software.tags && software.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {software.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {software.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
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
                    <div className="flex space-x-1 mt-2">
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
                        className="flex-1 text-xs text-red-600 hover:bg-red-50"
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