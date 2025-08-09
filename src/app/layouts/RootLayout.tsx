import { Outlet } from 'react-router-dom';
import { Header } from '@/shared/ui/Header';
import { Footer } from '@/shared/ui/Footer';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}