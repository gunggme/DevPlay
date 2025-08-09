import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { useAppSelector } from '@/store';
import { Code2, MessageSquare, Users, Zap } from 'lucide-react';

export function HomePage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-16 text-center">
        <h1 className="mb-6 text-4xl font-bold md:text-6xl">
          개발자와 사용자를 <br />
          <span className="text-primary">연결</span>하는 플랫폼
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
          소프트웨어를 공유하고, 피드백을 받고, 커뮤니티와 소통하세요.
          DevPlay에서 개발의 즐거움을 발견해보세요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link to="/software" data-testid="cta-software-button">소프트웨어 둘러보기</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/threads" data-testid="cta-threads-button">커뮤니티 참여하기</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Code2 className="size-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">소프트웨어 공유</h3>
            <p className="text-muted-foreground">
              개발한 소프트웨어를 쉽게 배포하고 버전 관리하세요.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="size-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">실시간 피드백</h3>
            <p className="text-muted-foreground">
              사용자들과 실시간으로 소통하고 피드백을 주고받으세요.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="size-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">커뮤니티</h3>
            <p className="text-muted-foreground">
              개발자들과 네트워크를 형성하고 협업의 기회를 만드세요.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="rounded-lg bg-muted/50 py-16 text-center">
          <div className="mx-auto max-w-2xl px-6">
            <Zap className="mx-auto mb-4 size-16 text-primary" />
            <h2 className="mb-4 text-3xl font-bold">지금 시작하세요</h2>
            <p className="mb-6 text-muted-foreground">
              DevPlay에 가입하고 개발자 커뮤니티의 일원이 되어보세요.
            </p>
            <Button size="lg">
              무료로 시작하기
            </Button>
          </div>
        </section>
      )}

      {/* Recent Activity - For logged in users */}
      {user && (
        <section className="py-16">
          <h2 className="mb-8 text-2xl font-bold">최근 활동</h2>
          <div className="rounded-lg bg-muted/50 p-8 text-center">
            <p className="text-muted-foreground">
              곧 최근 활동이 여기에 표시됩니다.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}