import { useContext, useEffect } from 'react';

import { Can } from '@nextauth/components/Can';
import { AuthContext } from '@nextauth/contexts/AuthContext';
import { setupApiClient } from '@nextauth/services/api';
import { api } from '@nextauth/services/apiClient';
import { withSSRAuth } from '@nextauth/utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get('/me').then(console.log).catch(console.error);
  }, []);

  return (
    <>
      <h1>Dashboard — {user?.email}</h1>

      <Can permissions={['metrics:list']}>
        <h2>Metrics</h2>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupApiClient(ctx);

  console.log((await apiClient.get('/me')).data);

  return { props: {} };
});
