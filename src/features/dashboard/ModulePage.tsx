import { Link, useParams } from 'react-router-dom'
import { useIdentity } from '../../auth/useIdentity'
import { canAccess, modules } from './modules'

export default function ModulePage() {
  const { module: slug } = useParams()
  const identity = useIdentity()
  const module = modules.find(item => item.slug === slug)
  if (!module || !canAccess(module, identity.roles)) return <section className="module-empty"><h1>Sección no disponible</h1><p>Esta sección no existe o no está disponible para tu rol.</p><Link className="text-link" to="/app">Volver al inicio →</Link></section>
  return <><div className="page-heading"><p className="section-kicker">MI COMUNIDAD</p><h1>{module.title}</h1><p>{module.description}</p></div><section className="module-empty"><span className="module-icon" aria-hidden="true">{module.icon}</span><h2>Estamos preparando esta sección</h2><p>La conexión con los datos se incorporará en la siguiente etapa.</p><Link className="text-link" to="/app">Volver al inicio →</Link></section></>
}
