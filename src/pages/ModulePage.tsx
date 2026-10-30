import { Link, useParams } from 'react-router-dom'
import { useIdentity } from '../auth/useIdentity'
import { canAccess, modules } from '../config/navigation'

export default function ModulePage() {
  const { module: slug } = useParams()
  const { roles } = useIdentity()
  const module = modules.find((item) => item.slug === slug)
  if (!module || !canAccess(module, roles))
    return (
      <section className="rounded-2xl border border-outline bg-white p-8 text-center sm:p-12">
        <h1 className="mb-4 text-2xl font-semibold">Sección no disponible</h1>
        <p className="text-sm leading-7 text-muted">
          Esta sección no existe o no está disponible para tu rol.
        </p>
        <Link className="mt-6 inline-block text-sm text-primary underline" to="/app">
          Volver al inicio →
        </Link>
      </section>
    )
  return (
    <>
      <header className="mb-8">
        <p className="mb-4 text-[10px] tracking-widest text-muted">MI COMUNIDAD</p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{module.title}</h1>
        <p className="text-sm leading-7 text-muted">{module.description}</p>
      </header>
      <section className="rounded-2xl border border-outline bg-white px-6 py-12 text-center">
        <span
          className="mx-auto mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-2xl text-primary"
          aria-hidden="true"
        >
          {module.icon}
        </span>
        <h2 className="mb-3 text-xl font-semibold">Estamos preparando esta sección</h2>
        <p className="text-sm leading-7 text-muted">
          La conexión con los datos se incorporará en la siguiente etapa.
        </p>
        <Link className="mt-6 inline-block text-sm text-primary underline" to="/app">
          Volver al inicio →
        </Link>
      </section>
    </>
  )
}
