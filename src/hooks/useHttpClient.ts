import { useMemo } from 'react'
import { useAuth } from 'react-oidc-context'
import { apiBaseUrl } from '../config/api'
import { createHttpClient } from '../services/http'

export function useHttpClient() {
  const { user } = useAuth()
  const token = user?.access_token ?? ''
  return useMemo(() => createHttpClient(apiBaseUrl, token), [token])
}
