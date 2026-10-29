import { useAuth } from 'react-oidc-context'
import { displayName, primaryRole, roleLabels, rolesFromProfile } from './identity'

export function useIdentity() {
  const auth = useAuth()
  const profile: Record<string, unknown> = auth.user?.profile ?? {}
  const roles = rolesFromProfile(profile)
  const role = primaryRole(roles)
  return { name: displayName(profile), roles, role, roleLabel: roleLabels[role] }
}
