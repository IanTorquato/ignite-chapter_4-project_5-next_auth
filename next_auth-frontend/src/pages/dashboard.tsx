import { useContext, useEffect } from 'react';

import { AuthContext } from '@nextauth/contexts/AuthContext';
import { useCan } from '@nextauth/hooks/useCan';
import { setupApiClient } from '@nextauth/services/api';
import { api } from '@nextauth/services/apiClient';
import { withSSRAuth } from '@nextauth/utils/withSSRAuth';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const userCanSeeMetrics = useCan({ permissions: ['metrics.list'] });

  useEffect(() => {
    api.get('/me').then(console.log).catch(console.error);
  }, []);

  return (
    <>
      <h1>Dashboard — {user?.email}</h1>
      {userCanSeeMetrics && <h2>Metrics</h2>}
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupApiClient(ctx);

  console.log((await apiClient.get('/me')).data);

  return { props: {} };
});
