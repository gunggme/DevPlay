import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { RoleStatusIndicator } from './RoleStatusIndicator';
import { RoleRequestForm } from './RoleRequestForm';
import { RoleRequestHistory } from './RoleRequestHistory';
import type { RoleRequest } from '@/shared/api/roleRequests';

interface RoleManagementProps {
  role: string;
  roleRequests: RoleRequest[] | undefined;
  canRequestDeveloper: boolean;
  onRequestDeveloper: (reason: string) => void;
  isLoading: boolean;
}

export function RoleManagement({ 
  role, 
  roleRequests, 
  canRequestDeveloper, 
  onRequestDeveloper, 
  isLoading 
}: RoleManagementProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleSubmitRequest = (reason: string) => {
    onRequestDeveloper(reason);
    setShowRequestForm(false);
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">역할 관리</h3>
      
      <RoleStatusIndicator role={role} />

      {role === 'user' && (
        <div className="mb-6">
          {canRequestDeveloper && !showRequestForm && (
            <div>
              <p className="mb-3 text-muted-foreground">
                개발자 권한을 요청하여 소프트웨어를 등록하고 관리할 수 있습니다.
              </p>
              <Button
                onClick={() => setShowRequestForm(true)}
                className="mb-4"
              >
                개발자 권한 요청
              </Button>
            </div>
          )}

          {showRequestForm && (
            <RoleRequestForm
              onSubmit={handleSubmitRequest}
              onCancel={() => setShowRequestForm(false)}
              isLoading={isLoading}
            />
          )}

          {!canRequestDeveloper && ( 
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <p className="text-yellow-700 dark:text-yellow-300">
                개발자 권한 요청이 진행 중입니다. 관리자의 승인을 기다려주세요.
              </p>
            </div>
          )}
        </div>
      )} 

      <RoleRequestHistory roleRequests={roleRequests || []} />
    </div>
  );
}