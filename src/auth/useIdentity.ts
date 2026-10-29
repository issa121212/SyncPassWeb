import { useContext } from 'react'
import { IdentityContext } from './identityContext'

export function useIdentity() {
  const identity = useContext(IdentityContext)
  if (!identity) throw new Error('useIdentity requires IdentityProvider')
  return identity
}
