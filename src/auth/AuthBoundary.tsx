import { useAuth } from 'react-oidc-context'
import { Outlet } from 'react-router-dom'
import PageLoading from '../components/PageLoading'

export default function AuthBoundary() {
  const auth = useAuth()
  if (auth.isLoading || auth.activeNavigator) return <PageLoading fullScreen />
  // A failed background refresh should not hide an otherwise valid session.
  if (auth.error && (!auth.isAuthenticated || auth.user?.expired))
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <section
          className="w-full max-w-md rounded-2xl border border-outline bg-white p-8 text-center"
          aria-labelledby="auth-error-title"
        >
          <p className="mb-4 text-xs tracking-widest text-muted">NO PUDIMOS INICIAR LA SESIÓN</p>
          <h1 id="auth-error-title" className="mb-4 text-2xl font-semibold">
            Volvamos a intentarlo
          </h1>
          <p className="mb-6 text-sm leading-7 text-muted">
            La solicitud pudo haber vencido o la configuración de acceso necesita revisión. Inicia
            el proceso nuevamente desde esta aplicación.
          </p>
          <a
            className="block rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
            href="/"
          >
            Volver al inicio
          </a>
        </section>
      </main>
    )
  return <Outlet />
}
