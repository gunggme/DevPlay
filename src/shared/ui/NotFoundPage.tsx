import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="mb-4 text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
      <p className="mb-8 text-muted-foreground">
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </p>
      <Button asChild>
        <Link to="/">
          <Home className="mr-2 size-4" />
          홈으로 돌아가기
        </Link>
      </Button>
    </div>
  );
}