import { useRouter } from 'next/dist/client/router';
import { parseCookies, setCookie } from 'nookies';
import { createContext, ReactNode, useEffect, useState } from 'react';

import { api } from '@nextauth/services/api';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

type AuthContextData = {
  isAuthenticated: boolean;
  user: User;
  signIn(credentials: SignInCredentials): Promise<void>;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();

    if (token) {
      api.get('/me').then((response) => {
        const { email, permissions, roles } = response.data;

        setUser({ email, permissions, roles });
      });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', { email, password });

      const { permissions, roles, token, refreshToken } = response.data;

      setUser({ email, permissions, roles });

      setCookie(undefined, 'nextauth.token', token, { path: '/', maxAge: 60 * 60 * 24 * 30 /* 30 days */ });
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, { path: '/', maxAge: 60 * 60 * 24 * 30 /* 30 days */ });

      api.defaults.headers.Authorization = `Bearer ${token}`;

      router.push('/dashboard');
    } catch (error) {
      console.error(error);
    }
  }

  return <AuthContext.Provider value={{ isAuthenticated, user, signIn }}>{children}</AuthContext.Provider>;
}
