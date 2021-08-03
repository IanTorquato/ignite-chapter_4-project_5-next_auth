import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

// eslint-disable-next-line import/no-cycle
import { signOut } from '@nextauth/contexts/AuthContext';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestQueue = [];

export const api = axios.create({
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
        cookies = parseCookies();

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

              setCookie(undefined, 'nextauth.token', token, { path: '/', maxAge: 60 * 60 * 24 * 30 /* 30 days */ });
              setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
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

      signOut();
    }

    return Promise.reject(error);
  },
);
