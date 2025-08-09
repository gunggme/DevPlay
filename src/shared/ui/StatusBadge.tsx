import { cn } from '@/shared/utils/cn';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      text: '대기중',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    },
    approved: {
      text: '승인됨', 
      className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    },
    rejected: {
      text: '거절됨',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-block px-2 py-1 rounded text-sm',
        config.className,
        className
      )}
    >
      {config.text}
    </span>
  );
}