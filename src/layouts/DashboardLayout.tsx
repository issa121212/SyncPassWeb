import { Suspense, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useIdentity } from '../auth/useIdentity'
import SignOutButton from '../components/SignOutButton'
import { availableModules } from '../config/navigation'
import PageLoading from '../components/PageLoading'
import { usePageNavigation } from '../hooks/usePageNavigation'

const navStyle = ({ isActive }: { isActive: boolean }) =>
  `flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 min-h-11 text-sm no-underline transition-colors motion-reduce:transition-none md:gap-3 md:px-4 ${isActive ? 'bg-primary/10 font-semibold text-primary' : 'text-muted hover:bg-primary/5'}`

export default function DashboardLayout() {
  const identity = useIdentity()
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const navigation = availableModules(identity.roles)
  const currentModule = navigation.find((module) => pathname === `/app/${module.slug}`)
  const pageTitle =
    pathname === '/app' ? 'Inicio' : (currentModule?.title ?? 'Sección no disponible')
  usePageNavigation(pathname, pageTitle, mainRef)
  return (
    <div className="min-h-dvh bg-canvas md:grid md:grid-cols-[210px_minmax(0,1fr)] lg:grid-cols-[238px_minmax(0,1fr)]">
      <a
        className="fixed top-2 left-2 z-10 -translate-y-24 rounded-lg bg-primary p-3 text-sm text-white focus:translate-y-0"
        href="#dashboard-content"
      >
        Ir al contenido
      </a>
      <aside className="border-b border-outline bg-white px-5 pt-5 pb-3 md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:overflow-y-auto md:border-r md:border-b-0 md:px-6 md:pt-8 md:pb-6">
        <NavLink
          className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight no-underline"
          to="/app"
        >
          <span
            className="mr-1 grid h-9 w-8 place-items-center rounded-xl bg-primary text-2xl text-white"
            aria-hidden="true"
          >
            S
          </span>
          SyncPass<span className="-ml-2 font-normal text-muted">Web</span>
        </NavLink>
        <p className="mt-12 mb-4 hidden shrink-0 px-3 text-xs tracking-[.18em] text-muted md:block">
          MI COMUNIDAD
        </p>
        <nav aria-label="Navegación principal" className="mt-5 md:mt-0">
          <ul className="flex list-none gap-1 overflow-x-auto p-0 pb-1 md:flex-col md:gap-2 md:overflow-visible">
            <li className="shrink-0">
              <NavLink className={navStyle} to="/app" end>
                <span className="w-5 text-center text-lg" aria-hidden="true">
                  ⌂
                </span>
                Inicio
              </NavLink>
            </li>
            {navigation.map((module) => (
              <li className="shrink-0" key={module.slug}>
                <NavLink className={navStyle} to={`/app/${module.slug}`}>
                  <span className="w-5 text-center text-lg" aria-hidden="true">
                    {module.icon}
                  </span>
                  {module.shortTitle}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto hidden shrink-0 items-center gap-3 border-t border-outline pt-6 md:flex">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary"
            aria-hidden="true"
          >
            {identity.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <strong className="block text-xs leading-5 wrap-anywhere">{identity.name}</strong>
            <p className="mt-1 text-xs leading-5 text-muted">{identity.roleLabel}</p>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-outline bg-white/80 px-5 py-3 sm:px-8 md:min-h-22 lg:px-12">
          <span className="text-xs text-muted">Tu comunidad, más cerca.</span>
          <SignOutButton />
        </header>
        <main
          ref={mainRef}
          aria-label={pageTitle}
          id="dashboard-content"
          className="mx-auto w-full max-w-7xl flex-1 px-5 pt-8 pb-14 sm:px-8 sm:pt-10 lg:px-12"
          tabIndex={-1}
        >
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="border-t border-outline px-5 py-5 text-[10px] text-muted sm:px-8 lg:px-12">
          SyncPass · Comunidad y participación
        </footer>
      </div>
    </div>
  )
}
