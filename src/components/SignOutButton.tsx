import { useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { cognito } from '../auth/config'
import { logoutUrl } from '../auth/logout'

export default function SignOutButton() {
  const auth = useAuth()
  const [leaving, setLeaving] = useState(false)
  const [error, setError] = useState(false)
  async function signOut() {
    setLeaving(true)
    setError(false)
    try {
      // Remove the local session before navigating to Cognito's logout endpoint.
      await auth.removeUser()
      window.location.assign(logoutUrl(cognito.domain, cognito.clientId, cognito.logoutUri))
    } catch {
      setError(true)
      setLeaving(false)
    }
  }
  return <div className="signout-control"><button className="signout-button" disabled={leaving} onClick={() => void signOut()}>{leaving ? 'Cerrando sesión…' : 'Cerrar sesión'} <span aria-hidden="true">↗</span></button>{error && <p role="alert">No se pudo cerrar la sesión. Inténtalo nuevamente.</p>}</div>
}
