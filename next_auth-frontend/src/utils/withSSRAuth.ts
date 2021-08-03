import decode from 'jwt-decode';
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { destroyCookie, parseCookies } from 'nookies';

import { AuthTokenError } from '@nextauth/errors/AuthTokenError';

import { validateUserPermissions } from './validateUserPermissions';

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
};

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
  // eslint-disable-next-line consistent-return
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    const token = cookies['nextauth.token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    if (options) {
      const user = decode<{ permissions: string[]; roles: string[] }>(token);
      const { permissions, roles } = options;

      const userHasValidPermissions = validateUserPermissions({ user, permissions, roles });

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false,
          },
        };
      }
    }

    try {
      return fn(ctx);
    } catch (error) {
      destroyCookie(ctx, 'nextauth.token');
      destroyCookie(ctx, 'nextauth.refreshToken');

      if (error instanceof AuthTokenError) {
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }
    }
  };
}
