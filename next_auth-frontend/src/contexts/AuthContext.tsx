import { createContext, ReactNode } from 'react';

import { api } from '@nextauth/services/api';

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthProviderProps = {
  children: ReactNode;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  isAuthenticated: boolean;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthenticated = false;

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', { email, password });
    } catch (error) {
      console.error(error);

      // eslint-disable-next-line no-alert
      alert(error);
    }
  }

  return <AuthContext.Provider value={{ isAuthenticated, signIn }}>{children}</AuthContext.Provider>;
}
