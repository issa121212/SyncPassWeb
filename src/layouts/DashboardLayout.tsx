import { NavLink, Outlet } from 'react-router-dom'
import { useIdentity } from '../auth/useIdentity'
import SignOutButton from '../components/SignOutButton'
import { availableModules } from '../features/dashboard/modules'
import './dashboard.css'

export default function DashboardLayout() {
  const identity = useIdentity()
  return <div className="dashboard-shell">
    <a className="skip-link" href="#dashboard-content">Ir al contenido</a>
    <aside className="sidebar">
      <NavLink className="dashboard-brand" to="/app"><span className="brand-symbol" aria-hidden="true">S</span>SyncPass<span>Web</span></NavLink>
      <p className="nav-label">MI COMUNIDAD</p>
      <nav aria-label="Navegación principal"><NavLink to="/app" end><span aria-hidden="true">⌂</span>Inicio</NavLink>{availableModules(identity.roles).map(module => <NavLink to={`/app/${module.slug}`} key={module.slug}><span aria-hidden="true">{module.icon}</span>{module.shortTitle}</NavLink>)}</nav>
      <div className="sidebar-footer"><span className="small-avatar" aria-hidden="true">{identity.name.slice(0, 1).toUpperCase()}</span><div><strong>{identity.name}</strong><p>{identity.roleLabel}</p></div></div>
    </aside>
    <div className="dashboard-body"><header className="dashboard-header"><span>Tu comunidad, más cerca.</span><SignOutButton /></header><main id="dashboard-content" className="dashboard-content" tabIndex={-1}><Outlet /></main><footer className="dashboard-footer">SyncPass · Comunidad y participación</footer></div>
  </div>
}
