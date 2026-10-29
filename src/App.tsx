import { useAuth } from 'react-oidc-context'
import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './features/dashboard/DashboardPage'
import ModulePage from './features/dashboard/ModulePage'

export default function App() {
  const auth = useAuth()
  if (auth.isLoading || auth.activeNavigator) return <main className="status-page"><section className="status-card" role="status"><span className="spinner" aria-hidden="true"/><h1>Preparando tu sesión</h1><p>Espera un momento…</p></section></main>
  if (auth.error) return <main className="status-page"><section className="status-card"><p className="eyebrow">NO PUDIMOS INICIAR LA SESIÓN</p><h1>Volvamos a intentarlo</h1><p>La solicitud pudo haber vencido o la configuración de acceso necesita revisión. Inicia el proceso nuevamente desde esta aplicación.</p><a className="primary-button" href="/">Volver al inicio</a></section></main>
  return <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/auth/callback" element={<Navigate to="/" replace />} />
    <Route element={<RequireAuth />}>
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path=":module" element={<ModulePage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
