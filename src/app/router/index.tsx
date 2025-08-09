import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { HomePage } from '@/features/home/view/HomePage';
import { AuthCallbackPage } from '@/features/auth/view/AuthCallbackPage';
import { ProfilePage } from '@/features/profile/view/ProfilePage';
import { SoftwarePage } from '@/features/software/view/SoftwarePage';
import { SoftwareDetailPage } from '@/features/software/view/SoftwareDetailPage';
import { ThreadsPage } from '@/features/threads/view/ThreadsPage';
import { ThreadDetailPage } from '@/features/threads/view/components/ThreadDetailPage';
import { AdminPage } from '@/features/admin/view/AdminPage';
import { NotFoundPage } from '@/shared/ui/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'auth/callback',
        element: <AuthCallbackPage />,
      },
      {
        path: 'profile/:username?',
        element: <ProfilePage />,
      },
      {
        path: 'software',
        element: <SoftwarePage />,
      },
      {
        path: 'software/:id',
        element: <SoftwareDetailPage />,
      },
      {
        path: 'threads',
        element: <ThreadsPage />,
      },
      {
        path: 'threads/:threadId',
        element: <ThreadDetailPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}