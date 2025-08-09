import { useState } from 'react';
import { Button } from '@/shared/ui/Button';

interface RoleRequestFormProps {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function RoleRequestForm({ onSubmit, onCancel, isLoading }: RoleRequestFormProps) {
  const [requestReason, setRequestReason] = useState('');

  const handleSubmit = () => {
    onSubmit(requestReason);
    setRequestReason('');
  };

  return (
    <div className="mb-4 rounded-lg border p-4">
      <h4 className="mb-3 font-medium text-card-foreground">개발자 권한 요청</h4>
      <textarea
        value={requestReason}
        onChange={(e) => setRequestReason(e.target.value)}
        placeholder="요청 사유를 입력해주세요 (선택사항)"
        className="w-full resize-none rounded-md border border-input bg-background p-2 text-foreground"
        rows={3}
      />
      <div className="mt-3 flex space-x-2">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? '요청 중...' : '요청하기'}
        </Button>
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          취소
        </Button>
      </div>
    </div>
  );
}