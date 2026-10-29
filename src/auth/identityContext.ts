import { createContext } from 'react'
import type { Role } from './identity'

export type Identity = {
  name: string
  roles: Role[]
  role: Role
  roleLabel: string
}

export const IdentityContext = createContext<Identity | null>(null)
