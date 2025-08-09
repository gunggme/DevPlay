import { Link } from 'react-router-dom';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-3 font-semibold">DevPlay</h3>
            <p className="text-sm text-muted-foreground">
              개발자와 사용자를 연결하는 플랫폼
            </p>
          </div>
          
          <div>
            <h4 className="mb-3 font-medium">제품</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/software" className="hover:text-primary" data-testid="footer-software-link">소프트웨어</Link></li>
              <li><Link to="/threads" className="hover:text-primary" data-testid="footer-threads-link">스레드</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-3 font-medium">지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-primary">도움말</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">개인정보 처리방침</Link></li>
              <li><Link to="/terms" className="hover:text-primary">이용약관</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-3 font-medium">소셜</h4>
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Github className="size-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Twitter className="size-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 DevPlay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}