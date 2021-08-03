import Router from 'next/dist/client/router';
import { destroyCookie } from 'nookies';

export function signOut() {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  const authChannel = new BroadcastChannel('auth');

  authChannel.postMessage('signOut');

  Router.push('/');
}
