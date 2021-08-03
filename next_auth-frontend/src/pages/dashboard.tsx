import { useContext, useEffect } from 'react';

import { Can } from '@nextauth/components/Can';
import { AuthContext } from '@nextauth/contexts/AuthContext';
import { setupApiClient } from '@nextauth/services/api';
import { api } from '@nextauth/services/apiClient';
import styles from '@nextauth/styles/dashboard.module.css';
import { withSSRAuth } from '@nextauth/utils/withSSRAuth';

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext);

  useEffect(() => {
    api.get('/me').then(console.log).catch(console.error);
  }, []);

  return (
    <div className={styles.container}>
      <h1>Dashboard — {user?.email}</h1>

      <button onClick={signOut}>Sign out</button>

      <Can permissions={['metrics.list']}>
        <h2>Metrics</h2>
      </Can>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupApiClient(ctx);

  console.log((await apiClient.get('/me')).data);

  return { props: {} };
});
