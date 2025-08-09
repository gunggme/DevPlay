interface RoleStatusIndicatorProps {
  role: string;
}

export function RoleStatusIndicator({ role }: RoleStatusIndicatorProps) {
  const roleConfig = {
    admin: {
      text: '관리자 권한을 보유하고 있습니다.',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      dotColor: 'bg-blue-500'
    },
    developer: {
      text: '개발자 권한을 보유하고 있습니다. 소프트웨어를 등록하고 관리할 수 있습니다.',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300',
      dotColor: 'bg-green-500'
    }
  };

  const config = roleConfig[role as keyof typeof roleConfig];
  if (!config) return null;

  return (
    <div className="mb-6">
      <div className={`flex items-center space-x-2 p-3 ${config.bgColor} rounded-lg`}>
        <div className={`size-2 ${config.dotColor} rounded-full`}></div>
        <p className={`${config.textColor} font-medium`}>
          {config.text}
        </p>
      </div>
    </div>
  );
}