import { ThreadList } from './components';

export function ThreadsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            스레드
          </h1>
          <p className="text-muted-foreground">
            개발자와 사용자간의 소통 공간
          </p>
        </div>
        <ThreadList />
      </div>
    </div>
  );
}