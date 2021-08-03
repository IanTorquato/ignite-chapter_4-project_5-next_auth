import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import { FormEvent, useContext, useState } from 'react';

import { AuthContext } from '@nextauth/contexts/AuthContext';

import styles from '../styles/home.module.css';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = { email, password };

    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <label htmlFor="email">E-mail:</label>
      <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="password">Senha</label>
      <input type="current-password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <button type="submit">Entrar</button>
    </form>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if (cookies['nextauth.token']) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return { props: {} };
};
