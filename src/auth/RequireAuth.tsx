import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import IdentityProvider from './IdentityProvider'
import QueryProvider from '../providers/QueryProvider'

export default function RequireAuth() {
  const auth = useAuth()
  const location = useLocation()
  if (!auth.isAuthenticated || auth.user?.expired) {
    return <Navigate to="/" replace state={{ returnTo: location.pathname + location.search }} />
  }
  return (
    <QueryProvider key={auth.user?.profile.sub}>
      <IdentityProvider>
        <Outlet />
      </IdentityProvider>
    </QueryProvider>
  )
}
