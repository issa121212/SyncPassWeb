import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import IdentityProvider from './IdentityProvider'

export default function RequireAuth() {
  const auth = useAuth()
  const location = useLocation()
  if (!auth.isAuthenticated || auth.user?.expired) {
    return <Navigate to="/" replace state={{ returnTo: location.pathname + location.search }} />
  }
  return (
    <IdentityProvider>
      <Outlet />
    </IdentityProvider>
  )
}
