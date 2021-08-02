import { useContext } from 'react';

import { AuthContext } from '@nextauth/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return <h1>Dashboard — {user?.email}</h1>;
}
