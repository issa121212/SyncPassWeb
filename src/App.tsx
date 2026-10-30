import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AuthBoundary from './auth/AuthBoundary'
import RequireAuth from './auth/RequireAuth'
import LoginPage from './pages/LoginPage'
import PageLoading from './components/PageLoading'

// The public login does not need the dashboard code until authentication succeeds.
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const DashboardEntry = lazy(() => import('./auth/DashboardEntry'))
const ModulePage = lazy(() => import('./pages/ModulePage'))
const EventsPage = lazy(() => import('./pages/EventsPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))

export default function App() {
  return (
    <Suspense fallback={<PageLoading fullScreen />}>
      <Routes>
        <Route element={<AuthBoundary />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/auth/callback" element={<Navigate to="/" replace />} />
          <Route element={<RequireAuth />}>
            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<DashboardEntry />} />
              <Route path="proyectos" element={<ProjectsPage />} />
              <Route path="eventos" element={<EventsPage />} />
              <Route path=":module" element={<ModulePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
