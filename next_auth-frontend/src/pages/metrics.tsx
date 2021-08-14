import { setupApiClient } from '@nextauth/services/api';
import { withSSRAuth } from '@nextauth/utils/withSSRAuth';

export default function Metrics() {
  return <h1>Metrics</h1>;
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupApiClient(ctx);

    console.log((await apiClient.get('/me')).data);

    return { props: {} };
  },
  {
    permissions: ['metrics.list'],
    roles: ['administrator'],
  },
);
