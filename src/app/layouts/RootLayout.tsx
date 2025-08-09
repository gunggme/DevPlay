import { Outlet } from 'react-router-dom';
import { Header } from '@/shared/ui/Header';
import { Footer } from '@/shared/ui/Footer';

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}