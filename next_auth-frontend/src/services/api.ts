import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { parseCookies, setCookie } from 'nookies';

import { AuthTokenError } from '@nextauth/errors/AuthTokenError';
import { signOut } from '@nextauth/utils/signOut';

let isRefreshing = false;
let failedRequestQueue = [];

export function setupApiClient(ctx: GetServerSidePropsContext = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`,
    },
  });

  api.interceptors.response.use(
    (response) => response,
    // eslint-disable-next-line consistent-return
    (error: AxiosError) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === 'token.expired') {
          cookies = parseCookies(ctx);

          const { 'nextauth.refreshToken': refreshToken } = cookies;
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post('/refresh', {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data;

                setCookie(ctx, 'nextauth.token', token, { path: '/', maxAge: 60 * 60 * 24 * 30 /* 30 days */ });
                setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                  path: '/',
                  maxAge: 60 * 60 * 24 * 30 /* 30 days */,
                });

                api.defaults.headers.Authorization = `Bearer ${token}`;

                failedRequestQueue.forEach((failedRequest) => failedRequest.onSuccess(token));
                failedRequestQueue = [];
              })
              .catch((err) => {
                failedRequestQueue.forEach((failedRequest) => failedRequest.onFailure(err));
                failedRequestQueue = [];

                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers.Authorization = `Bearer ${token}`;

                resolve(api(originalConfig));
              },
              onFailure: (erro: AxiosError) => {
                reject(erro);
              },
            });
          });
        }

        if (process.browser) {
          signOut();
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }

      return Promise.reject(error);
    },
  );

  return api;
}
