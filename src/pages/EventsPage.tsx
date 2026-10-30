import { useState } from 'react'
import { useIdentity } from '../auth/useIdentity'
import { useEvents } from '../hooks/useEvents'
import { canManageProject, canDeleteEvent } from '../types/evento'
import { errorMessage } from '../services/http'
import type { Evento } from '../types/evento'
import Modal from '../components/Modal'
import EventForm from '../components/events/EventForm'
import EventCard from '../components/events/EventCard'
import PageLoading from '../components/PageLoading'
import EventRegistration from '../components/events/EventRegistration'

export default function EventsPage() {
  const { roles } = useIdentity()
  const manager = roles.includes('DOCENTE') || roles.includes('ADMIN')
  const { events, projects, me, save, remove } = useEvents(manager)
  const manageableProjects =
    projects.data?.filter((project) => canManageProject(project, roles, me.data?.id)) ?? []
  const permissionsReady =
    manager && projects.isSuccess && (roles.includes('ADMIN') || me.isSuccess)
  const [editor, setEditor] = useState<{ event?: Evento } | null>(null)
  const [deleting, setDeleting] = useState<Evento | null>(null)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const filtered =
    events.data?.filter((event) =>
      `${event.nombre} ${event.proyectoNombre} ${event.recinto ?? ''}`
        .toLocaleLowerCase('es')
        .includes(search.trim().toLocaleLowerCase('es')),
    ) ?? []
  async function confirmDelete() {
    if (!deleting || remove.isPending || !canDeleteEvent(deleting)) return
    try {
      await remove.mutateAsync(deleting.id)
      setDeleting(null)
      setNotice('Evento eliminado correctamente.')
    } catch {
      /* Mutation error remains visible inside the dialog. */
    }
  }
  return (
    <>
      <header className="mb-7 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="mb-3 text-xs tracking-widest text-muted">MI COMUNIDAD</p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">Eventos y talleres</h1>
          <p className="text-sm leading-7 text-muted">
            Consulta las actividades y gestiona los eventos de tu comunidad.
          </p>
        </div>
        {permissionsReady && manageableProjects.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setNotice('')
              setEditor({})
              save.reset()
            }}
            className="min-h-12 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Nuevo evento
          </button>
        )}
      </header>
      {notice && (
        <output className="mb-5 block rounded-xl bg-primary-container p-4 text-sm text-on-container">
          {notice}
        </output>
      )}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="event-search" className="mb-2 block text-sm font-medium">
            Buscar eventos
          </label>
          <input
            id="event-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre, proyecto o recinto"
            className="min-h-11 w-full rounded-xl border border-outline bg-white px-4 py-2 text-base"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            void events.refetch()
            if (manager) void projects.refetch()
            if (manager) void me.refetch()
          }}
          disabled={events.isFetching}
          className="min-h-11 rounded-full border border-primary/40 px-5 py-2 text-sm text-primary"
        >
          {events.isFetching ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>
      {events.isPending && <PageLoading />}
      {events.isError && (
        <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm leading-7 text-red-800">
          {errorMessage(events.error)}
          {events.data && ' Se muestran los últimos datos recibidos.'}
        </p>
      )}
      {manager && (projects.isError || me.isError) && (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900"
        >
          No se pudieron comprobar tus permisos o proyectos. Actualiza para habilitar la gestión de
          eventos.
        </p>
      )}
      {manager && !permissionsReady && !projects.isError && !me.isError && (
        <output className="mb-5 block text-sm text-muted">Comprobando proyectos y permisos…</output>
      )}
      {permissionsReady && !manageableProjects.length && (
        <p className="mb-5 text-sm text-muted">
          Necesitas un proyecto a tu cargo para crear eventos.
        </p>
      )}
      {events.data && (
        <>
          <p className="mb-4 text-sm text-muted">
            {filtered.length} {filtered.length === 1 ? 'evento' : 'eventos'}
          </p>
          {filtered.length ? (
            <ul className="grid list-none grid-cols-1 gap-5 p-0 xl:grid-cols-2">
              {filtered.map((event) => (
                <li key={event.id} className="min-w-0">
                  <EventCard
                    event={event}
                    editable={
                      permissionsReady &&
                      manageableProjects.some((candidate) => candidate.id === event.proyectoId)
                    }
                    onEdit={() => {
                      setNotice('')
                      setEditor({ event })
                      save.reset()
                    }}
                    onDelete={() => {
                      setNotice('')
                      setDeleting(event)
                      remove.reset()
                    }}
                  >
                    {roles.includes('PARTICIPANTE') && <EventRegistration event={event} />}
                  </EventCard>
                </li>
              ))}
            </ul>
          ) : (
            <section className="rounded-2xl border border-outline bg-white p-8 text-center">
              <h2 className="mb-3 text-xl font-semibold">
                {search ? 'No encontramos coincidencias' : 'Todavía no hay eventos'}
              </h2>
              <p className="text-sm leading-7 text-muted">
                {search
                  ? 'Prueba con otra búsqueda.'
                  : 'Las actividades aparecerán aquí cuando se creen.'}
              </p>
            </section>
          )}
        </>
      )}
      {editor && (
        <Modal
          title={editor.event ? 'Editar evento' : 'Nuevo evento'}
          onClose={() => setEditor(null)}
          busy={save.isPending}
        >
          <EventForm
            event={editor.event}
            projects={manageableProjects}
            busy={save.isPending}
            onClose={() => setEditor(null)}
            onSave={async (form) => {
              await save.mutateAsync({ id: editor.event?.id, form })
              setEditor(null)
              setNotice(
                editor.event ? 'Evento actualizado correctamente.' : 'Evento creado correctamente.',
              )
            }}
          />
        </Modal>
      )}
      {deleting && (
        <Modal title="Eliminar evento" onClose={() => setDeleting(null)} busy={remove.isPending}>
          <p className="text-sm leading-7">
            ¿Quieres eliminar <strong className="wrap-anywhere">{deleting.nombre}</strong>? Esta
            acción no se puede deshacer.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Si tiene inscripciones o asistencias, el servidor impedirá eliminarlo. Puedes cancelarlo
            desde Editar.
          </p>
          {remove.isError && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800"
            >
              {errorMessage(remove.error)}
            </p>
          )}
          <footer className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => setDeleting(null)}
              className="min-h-11 rounded-full border border-outline px-5 py-2 text-sm text-primary"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => void confirmDelete()}
              className="min-h-11 rounded-full bg-red-800 px-5 py-2 text-sm font-semibold text-white"
            >
              {remove.isPending ? 'Eliminando…' : 'Eliminar evento'}
            </button>
          </footer>
        </Modal>
      )}
    </>
  )
}
