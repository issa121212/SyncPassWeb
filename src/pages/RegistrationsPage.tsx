import { Link } from 'react-router-dom'
import { useIdentity } from '../auth/useIdentity'
import { useEvents } from '../hooks/useEvents'
import { errorMessage } from '../services/http'
import EventCard from '../components/events/EventCard'
import EventRegistration from '../components/events/EventRegistration'
import PageLoading from '../components/PageLoading'

const noAction = () => {}

export default function RegistrationsPage() {
  const { roles } = useIdentity()
  if (!roles.includes('PARTICIPANTE'))
    return (
      <section>
        <h1 className="mb-3 text-3xl font-bold">Sección no disponible</h1>
        <p className="text-muted">Las inscripciones están disponibles para participantes.</p>
        <Link to="/app" className="mt-5 inline-block text-primary underline">
          Volver al inicio
        </Link>
      </section>
    )
  return <MyRegistrations />
}

function MyRegistrations() {
  const { events } = useEvents(false)
  const registered = events.data?.filter((event) => event.inscrito) ?? []
  return (
    <>
      <header className="mb-7 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Mis inscripciones</h1>
          <p className="text-sm leading-7 text-muted">
            Consulta tus actividades y el estado de tu asistencia. Inscribirte no marca tu
            asistencia.
          </p>
        </div>
        <button
          type="button"
          disabled={events.isFetching}
          onClick={() => void events.refetch()}
          className="min-h-11 rounded-full border border-primary/40 px-5 py-2 text-sm text-primary"
        >
          {events.isFetching ? 'Actualizando…' : 'Actualizar'}
        </button>
      </header>
      {events.isPending && <PageLoading />}
      {events.isError && (
        <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
          {errorMessage(events.error)}
          {events.data && ' Se muestran los últimos datos recibidos.'}
        </p>
      )}
      {events.data &&
        (registered.length ? (
          <ul className="grid list-none grid-cols-1 gap-5 p-0 xl:grid-cols-2">
            {registered.map((event) => (
              <li key={event.id} className="min-w-0">
                <EventCard event={event} editable={false} onEdit={noAction} onDelete={noAction}>
                  <EventRegistration event={event} />
                </EventCard>
              </li>
            ))}
          </ul>
        ) : (
          <section className="rounded-2xl border border-outline bg-white p-8 text-center">
            <h2 className="mb-3 text-xl font-semibold">Todavía no tienes inscripciones</h2>
            <p className="text-sm leading-7 text-muted">
              Busca una actividad y participa en tu comunidad.
            </p>
            <Link to="/app/eventos" className="mt-5 inline-block text-primary underline">
              Explorar eventos
            </Link>
          </section>
        ))}
    </>
  )
}
