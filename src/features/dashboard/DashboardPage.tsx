import { Link } from 'react-router-dom'
import { useIdentity } from '../../auth/useIdentity'
import { availableModules } from './modules'

const introductions = {
  ADMIN: 'Coordina los proyectos, las actividades y el seguimiento de tu comunidad.',
  DOCENTE: 'Organiza tus proyectos y talleres, y acompaña la participación de tu comunidad.',
  VOLUNTARIO: 'Acompaña a tu comunidad en cada actividad y colabora con la recepción.',
  PARTICIPANTE: 'Encuentra los próximos encuentros y acompaña tus actividades.',
}

export default function DashboardPage() {
  const identity = useIdentity()
  return <>
    <div className="page-heading"><p className="section-kicker">{identity.roleLabel}</p><h1>Hola, {identity.name}<span className="welcome-dot">.</span></h1><p>{introductions[identity.role]}</p></div>
    <section className="welcome-banner" aria-labelledby="welcome-title"><span className="welcome-icon" aria-hidden="true">✦</span><div><h2 id="welcome-title">Tu espacio en SyncPass</h2><p>Desde aquí podrás acceder a las herramientas de tu comunidad según tu rol.</p></div><span className="session-pill">● Sesión iniciada</span></section>
    <section aria-labelledby="modules-title"><div className="section-heading"><h2 id="modules-title">¿Por dónde empezamos?</h2><span>Accesos de tu cuenta</span></div><div className="module-grid">{availableModules(identity.roles).map(module => <Link className="module-card" to={`/app/${module.slug}`} key={module.slug}><span className="module-icon" aria-hidden="true">{module.icon}</span><h3>{module.title}</h3><p>{module.description}</p><span className="module-link">Abrir sección <span aria-hidden="true">→</span></span></Link>)}</div></section>
    <p className="stage-note">Estamos preparando las secciones. Aún no se muestran datos de proyectos, eventos ni asistencias.</p>
  </>
}
