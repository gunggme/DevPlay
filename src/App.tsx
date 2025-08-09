import { Providers } from '@/app/providers';
import { AppRouter } from '@/app/router';
import '@/styles/globals.css';
import '@/shared/lib/debugSupabase';

function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}

export default App;