import { useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { Navigate, useLocation } from 'react-router-dom'
import { returnPath } from '../auth/session'

export default function LoginPage() {
  const auth = useAuth()
  const location = useLocation()
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState(false)
  async function signIn() {
    setStarting(true)
    setError(false)
    try {
      await auth.signinRedirect({ state: { returnTo: returnPath(location.state) } })
    } catch {
      setError(true)
      setStarting(false)
    }
  }
  if (auth.isAuthenticated && !auth.user?.expired) return <Navigate to={returnPath(location.state)} replace />
  return <main className="simple-login">
      <section aria-labelledby="login-title">
        <h1 id="login-title">SyncPass</h1>
        {error && <p className="error-message" role="alert">No se pudo abrir el inicio de sesión. Comprueba tu conexión e inténtalo de nuevo.</p>}
        <button className="primary-button" disabled={starting} onClick={() => void signIn()}>{starting ? 'Abriendo Cognito…' : 'Continuar con Cognito'}</button>
      </section>
    </main>
}
