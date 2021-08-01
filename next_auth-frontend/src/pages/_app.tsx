import { AppProps } from 'next/dist/next-server/lib/router/router';

import { AuthProvider } from '@nextauth/contexts/AuthContext';

import '../styles/global.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
