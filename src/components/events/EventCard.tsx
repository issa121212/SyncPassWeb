import { canDeleteEvent, eventStateLabels } from '../../types/evento'
import type { Evento } from '../../types/evento'
export default function EventCard({
  event,
  editable,
  onEdit,
  onDelete,
}: {
  event: Evento
  editable: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const [date, time] = event.fechaHora.split('T')
  const displayDate = date?.split('-').reverse().join('-')
  return (
    <article
      className="flex h-full min-w-0 flex-col rounded-2xl bg-card p-5 sm:p-6"
      aria-labelledby={`event-${event.id}`}
    >
      <div className="mb-3 flex flex-wrap justify-between gap-3">
        <h2 id={`event-${event.id}`} className="text-lg font-semibold wrap-anywhere">
          {event.nombre}
        </h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
          {eventStateLabels[event.estado]}
        </span>
      </div>
      {event.descripcion && (
        <p className="mb-4 text-sm leading-7 wrap-anywhere whitespace-pre-wrap text-muted">
          {event.descripcion}
        </p>
      )}
      <dl className="mt-auto space-y-2 text-sm leading-6 text-muted">
        <div>
          <dt className="inline font-medium">Proyecto: </dt>
          <dd className="inline wrap-anywhere">{event.proyectoNombre}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Fecha y hora: </dt>
          <dd className="inline">
            <time dateTime={event.fechaHora}>
              {displayDate} · {time?.slice(0, 5)}
            </time>
          </dd>
        </div>
        <div>
          <dt className="inline font-medium">Cupos: </dt>
          <dd className="inline">
            {event.cupos || 'Sin límite'} · {event.inscritos} inscritos · {event.presentes}{' '}
            presentes
          </dd>
        </div>
        {event.recinto && (
          <div>
            <dt className="inline font-medium">Recinto: </dt>
            <dd className="inline wrap-anywhere">{event.recinto}</dd>
          </div>
        )}
        {event.direccion && (
          <div>
            <dt className="inline font-medium">Dirección: </dt>
            <dd className="inline wrap-anywhere">{event.direccion}</dd>
          </div>
        )}
      </dl>
      {editable && (
        <footer className="mt-5 border-t border-primary/15 pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Editar ${event.nombre}`}
              className="min-h-11 rounded-full border border-primary/40 px-4 py-2 text-sm text-primary"
            >
              Editar
            </button>
            <button
              type="button"
              disabled={!canDeleteEvent(event)}
              onClick={onDelete}
              aria-label={`Eliminar ${event.nombre}`}
              className="min-h-11 rounded-full px-4 py-2 text-sm text-red-800 disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
          {!canDeleteEvent(event) && (
            <p className="mt-3 text-xs leading-6 text-muted">
              Este evento tiene historial. Puedes cancelarlo desde Editar.
            </p>
          )}
        </footer>
      )}
    </article>
  )
}
