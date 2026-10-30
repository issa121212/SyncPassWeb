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
  return (
    <div>
      <button
        type="button"
        aria-busy={leaving}
        className="flex min-h-11 items-center gap-3 rounded-xl border border-outline bg-white px-3 py-2 text-sm text-primary hover:bg-primary/5"
        disabled={leaving}
        onClick={() => void signOut()}
      >
        {leaving ? 'Cerrando sesión…' : 'Cerrar sesión'} <span aria-hidden="true">↗</span>
      </button>
      {error && (
        <p className="mt-2 max-w-60 text-xs text-red-800" role="alert">
          No se pudo cerrar la sesión. Inténtalo nuevamente.
        </p>
      )}
    </div>
  )
}
