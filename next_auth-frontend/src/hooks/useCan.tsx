import { useContext } from 'react';

import { AuthContext } from '@nextauth/contexts/AuthContext';
import { validateUserPermissions } from '@nextauth/utils/validateUserPermissions';

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return false;
  }

  const userHasValidPermissions = validateUserPermissions({ user, permissions, roles });

  return userHasValidPermissions;
}
