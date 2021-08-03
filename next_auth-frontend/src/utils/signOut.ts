import Router from 'next/dist/client/router';
import { destroyCookie } from 'nookies';

export function signOut() {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  Router.push('/');
}
