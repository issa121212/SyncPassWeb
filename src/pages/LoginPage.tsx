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
  if (auth.isAuthenticated && !auth.user?.expired)
    return <Navigate to={returnPath(location.state)} replace />
  return (
    <main className="grid min-h-dvh place-items-center bg-surface p-6">
      <section className="w-full max-w-80 text-center" aria-labelledby="login-title">
        <h1 className="mb-7 text-3xl font-bold" id="login-title">
          SyncPass
        </h1>
        {error && (
          <p
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
            role="alert"
          >
            No se pudo abrir el inicio de sesión. Comprueba tu conexión e inténtalo de nuevo.
          </p>
        )}
        <button
          type="button"
          aria-busy={starting}
          className="min-h-12 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          disabled={starting}
          onClick={() => void signIn()}
        >
          {starting ? 'Abriendo Cognito…' : 'Continuar con Cognito'}
        </button>
      </section>
    </main>
  )
}
