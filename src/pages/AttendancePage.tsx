import { useState } from 'react'
import { useIdentity } from '../auth/useIdentity'
import { useEvents } from '../hooks/useEvents'
import { canManageProject } from '../types/evento'
import { errorMessage } from '../services/http'
import AttendanceConsole from '../components/attendance/AttendanceConsole'
import PageLoading from '../components/PageLoading'
export default function AttendancePage() {
  const { roles } = useIdentity()
  if (!roles.some((role) => ['DOCENTE', 'ADMIN', 'VOLUNTARIO'].includes(role)))
    return (
      <section>
        <h1 className="mb-3 text-3xl font-bold">Sección no disponible</h1>
        <p>El control de asistencia está disponible para recepción y coordinación.</p>
      </section>
    )
  return <AttendanceManager />
}
function AttendanceManager() {
  const { roles } = useIdentity()
  const ownership = !roles.includes('ADMIN') && !roles.includes('VOLUNTARIO')
  const { events, projects, me } = useEvents(ownership)
  const [selected, setSelected] = useState('')
  const [busy, setBusy] = useState(false)
  const permissionsReady = !ownership || (projects.isSuccess && me.isSuccess)
  const permissionError = ownership && (projects.isError || me.isError)
  const eligible = permissionsReady
    ? (events.data?.filter(
        (event) =>
          !ownership ||
          projects.data?.some(
            (project) =>
              project.id === event.proyectoId && canManageProject(project, roles, me.data?.id),
          ),
      ) ?? [])
    : []
  const current = eligible.find((event) => String(event.id) === selected)
  return (
    <>
      <header className="mb-7">
        <p className="mb-3 text-xs tracking-widest text-muted">RECEPCIÓN</p>
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Control de asistencia</h1>
        <p className="text-sm leading-7 text-muted">
          Selecciona el evento antes de leer el QR de un participante.
        </p>
      </header>
      {(events.isPending || (!permissionsReady && !permissionError)) && <PageLoading />}
      {events.isError && (
        <p role="alert" className="mb-4 text-sm text-red-800">
          {errorMessage(events.error)}
        </p>
      )}
      {permissionError && (
        <p role="alert" className="mb-4 text-sm text-red-800">
          No se pudieron comprobar tus proyectos y permisos. Actualiza para volver a intentar.
        </p>
      )}
      <button
        type="button"
        disabled={events.isFetching || busy}
        onClick={() => {
          void events.refetch()
          if (ownership) {
            void projects.refetch()
            void me.refetch()
          }
        }}
        className="mb-5 min-h-11 rounded-full border border-primary/40 px-5 py-2 text-sm text-primary"
      >
        {events.isFetching ? 'Actualizando…' : 'Actualizar eventos'}
      </button>
      {permissionsReady && events.data && !permissionError && (
        <div className="mb-7">
          <label htmlFor="attendance-event" className="mb-2 block text-sm font-medium">
            Evento
          </label>
          <select
            id="attendance-event"
            value={current ? selected : ''}
            onChange={(e) => setSelected(e.target.value)}
            disabled={busy}
            className="min-h-11 w-full min-w-0 rounded-xl border border-outline bg-white px-3 py-2 text-base"
          >
            <option value="">Selecciona un evento</option>
            {eligible.map((event) => (
              <option key={event.id} value={event.id}>
                {event.nombre} — {event.proyectoNombre}
              </option>
            ))}
          </select>
          {!eligible.length && (
            <p className="mt-3 text-sm text-muted">
              No hay eventos disponibles para tu rol o tus proyectos.
            </p>
          )}
        </div>
      )}
      {current && !permissionError && (
        <AttendanceConsole key={current.id} event={current} onBusy={setBusy} />
      )}
    </>
  )
}
