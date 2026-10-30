import { useId } from 'react'
import { Link } from 'react-router-dom'
import { modules, canAccess } from '../../config/navigation'
import type { ModuleSlug } from '../../config/navigation'
import { useIdentity } from '../../auth/useIdentity'

export default function DashboardCards({
  title,
  sections,
}: {
  title: string
  sections: readonly ModuleSlug[]
}) {
  const { roles } = useIdentity()
  const headingId = useId()
  const cards = modules.filter(
    (module) => sections.includes(module.slug) && canAccess(module, roles),
  )
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="mb-5 text-lg font-semibold">
        {title}
      </h2>
      <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((module) => (
          <li className="min-w-0" key={module.slug}>
            <Link
              className="flex h-full min-w-0 flex-col rounded-2xl border border-transparent bg-card p-6 no-underline transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-sm motion-reduce:transition-none"
              to={`/app/${module.slug}`}
            >
              <span
                className="mb-5 grid size-11 place-items-center rounded-xl bg-primary/8 text-2xl text-primary"
                aria-hidden="true"
              >
                {module.icon}
              </span>
              <h3 className="mb-3 text-base font-semibold">{module.title}</h3>
              <p className="mb-6 text-sm leading-7 text-muted">{module.description}</p>
              <span className="mt-auto flex items-center justify-between gap-3 text-xs font-semibold text-primary">
                Abrir sección <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
