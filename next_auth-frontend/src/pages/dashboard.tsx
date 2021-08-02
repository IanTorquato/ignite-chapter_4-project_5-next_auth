import { useContext, useEffect } from 'react';

import { AuthContext } from '@nextauth/contexts/AuthContext';
import { api } from '@nextauth/services/api';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get('/me').then(console.log);
  }, []);

  return <h1>Dashboard — {user?.email}</h1>;
}
