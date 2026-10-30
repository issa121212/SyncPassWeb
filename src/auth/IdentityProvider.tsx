import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from 'react-oidc-context'
import { IdentityContext } from './identityContext'
import { displayName, primaryRole, roleLabels, rolesFromProfile } from './identity'

const emptyProfile: Record<string, unknown> = {}

export default function IdentityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const profile = user?.profile ?? emptyProfile
  // Keep the shared value stable when unrelated authentication state changes.
  const identity = useMemo(() => {
    const roles = rolesFromProfile(profile)
    const role = primaryRole(roles)
    return { name: displayName(profile), roles, role, roleLabel: roleLabels[role] }
  }, [profile])

  return <IdentityContext value={identity}>{children}</IdentityContext>
}
