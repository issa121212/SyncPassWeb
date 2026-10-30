import { stateLabels } from '../../types/proyecto'
import type { Proyecto } from '../../types/proyecto'

function projectDate(date: string | null): string {
  if (!date) return 'Sin definir'
  const [year, month, day] = date.split('-')
  return `${day}-${month}-${year}`
}

export default function ProjectCard({
  project,
  editable,
  onEdit,
  onDelete,
}: {
  project: Proyecto
  editable: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article
      className="flex h-full min-w-0 flex-col rounded-2xl bg-card p-5 sm:p-6"
      aria-labelledby={`project-${project.id}`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <h2 id={`project-${project.id}`} className="text-lg font-semibold wrap-anywhere">
          {project.nombre}
        </h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
          {stateLabels[project.estado]}
        </span>
      </div>
      {project.descripcion && (
        <p className="mb-4 text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-muted">
          {project.descripcion}
        </p>
      )}
      <dl className="mt-auto space-y-2 text-sm leading-6 text-muted">
        <div>
          <dt className="inline font-medium">Responsable: </dt>
          <dd className="inline wrap-anywhere">
            {project.responsable?.nombre || 'Sin responsable'}
          </dd>
        </div>
        {project.areaTematica && (
          <div>
            <dt className="inline font-medium">Área: </dt>
            <dd className="inline wrap-anywhere">{project.areaTematica}</dd>
          </div>
        )}
        {project.unidadVecinal && (
          <div>
            <dt className="inline font-medium">Unidad vecinal: </dt>
            <dd className="inline wrap-anywhere">{project.unidadVecinal}</dd>
          </div>
        )}
        <div>
          <dt className="inline font-medium">Inicio: </dt>
          <dd className="inline">
            {project.fechaInicio ? (
              <time dateTime={project.fechaInicio}>{projectDate(project.fechaInicio)}</time>
            ) : (
              'Sin definir'
            )}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium">Fin: </dt>
          <dd className="inline">
            {project.fechaFin ? (
              <time dateTime={project.fechaFin}>{projectDate(project.fechaFin)}</time>
            ) : (
              'Sin definir'
            )}
          </dd>
        </div>
      </dl>
      {editable ? (
        <footer className="mt-5 flex flex-wrap gap-3 border-t border-primary/15 pt-4">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${project.nombre}`}
            className="min-h-11 rounded-full border border-primary/40 px-4 py-2 text-sm text-primary hover:bg-white/40"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Eliminar ${project.nombre}`}
            className="min-h-11 rounded-full px-4 py-2 text-sm text-red-800 hover:bg-red-50"
          >
            Eliminar
          </button>
        </footer>
      ) : (
        <p className="mt-4 text-xs leading-6 text-muted">
          Solo el responsable o un administrador puede modificar este proyecto.
        </p>
      )}
    </article>
  )
}
