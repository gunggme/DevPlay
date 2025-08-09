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
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          개발자와 사용자를 <br />
          <span className="text-primary">연결</span>하는 플랫폼
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          소프트웨어를 공유하고, 피드백을 받고, 커뮤니티와 소통하세요.
          DevPlay에서 개발의 즐거움을 발견해보세요.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
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
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Code2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">소프트웨어 공유</h3>
            <p className="text-muted-foreground">
              개발한 소프트웨어를 쉽게 배포하고 버전 관리하세요.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">실시간 피드백</h3>
            <p className="text-muted-foreground">
              사용자들과 실시간으로 소통하고 피드백을 주고받으세요.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">커뮤니티</h3>
            <p className="text-muted-foreground">
              개발자들과 네트워크를 형성하고 협업의 기회를 만드세요.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-muted/50 rounded-lg text-center">
          <div className="max-w-2xl mx-auto px-6">
            <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">지금 시작하세요</h2>
            <p className="text-muted-foreground mb-6">
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
          <h2 className="text-2xl font-bold mb-8">최근 활동</h2>
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              곧 최근 활동이 여기에 표시됩니다.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}