import { useRef, useState } from 'react'
import { useAttendance } from '../../hooks/useAttendance'
import { qrError } from '../../types/asistencia'
import type { Escaneo } from '../../types/asistencia'
import type { Evento } from '../../types/evento'
import { errorMessage } from '../../services/http'
import PageLoading from '../PageLoading'
import QrInput from './QrInput'
export default function AttendanceConsole({
  event,
  onBusy,
}: {
  event: Evento
  onBusy: (busy: boolean) => void
}) {
  const { attendees, scan } = useAttendance(event.id)
  const [candidate, setCandidate] = useState<Escaneo | null>(null)
  const [error, setError] = useState('')
  const sending = useRef(false)
  const open = event.estado === 'PROGRAMADO' || event.estado === 'EN_CURSO'
  function read(content: string) {
    if (sending.current) return
    const code = content.trim()
    const invalid = qrError(code, event.id)
    if (invalid) {
      setError(invalid)
      return
    }
    scan.reset()
    setError('')
    setCandidate({
      codigoQr: code,
      clientUuid: crypto.randomUUID(),
      marcadoEn: new Date().toISOString(),
      esPresente: true,
    })
  }
  async function confirm() {
    if (!candidate || sending.current || !open || !attendees.isSuccess || attendees.isError) return
    sending.current = true
    onBusy(true)
    try {
      await scan.mutateAsync(candidate)
    } catch {
      /* The mutation preserves the backend's rejection; retry keeps clientUuid. */
    } finally {
      sending.current = false
      onBusy(false)
    }
  }
  const present = attendees.data?.filter((item) => item.presente).length ?? 0
  return (
    <section aria-labelledby="attendance-event-title" className="space-y-6">
      <header>
        <h2 id="attendance-event-title" className="text-2xl font-semibold wrap-anywhere">
          {event.nombre}
        </h2>
        <p className="mt-2 text-sm wrap-anywhere text-muted">{event.proyectoNombre}</p>
      </header>
      {attendees.isPending && <PageLoading />}
      {attendees.isError && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
          {errorMessage(attendees.error)}
        </p>
      )}
      <button
        type="button"
        disabled={attendees.isFetching || scan.isPending}
        onClick={() => void attendees.refetch()}
        className="min-h-11 rounded-full border border-primary/40 px-5 py-2 text-sm text-primary"
      >
        {attendees.isFetching ? 'Actualizando…' : 'Actualizar asistentes'}
      </button>
      {!open && (
        <p className="rounded-xl bg-primary-container p-4 text-sm text-on-container">
          El evento está cancelado o finalizado. Puedes consultar su asistencia.
        </p>
      )}
      {open && attendees.isSuccess && !attendees.isError && (
        <section
          className="rounded-2xl border border-outline bg-white p-5 sm:p-6"
          aria-labelledby="scan-title"
        >
          <h3 id="scan-title" className="mb-3 text-lg font-semibold">
            Registrar asistencia
          </h3>
          <p className="mb-5 text-sm leading-7 text-muted">
            Lee el QR personal del participante y confirma el registro en {event.nombre}. Si no
            estaba inscrito, el servidor puede inscribirlo si hay cupos.
          </p>
          {!candidate && <QrInput onRead={read} disabled={scan.isPending} />}
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-800">
              {error}
            </p>
          )}
          {candidate && !scan.isSuccess && (
            <div className="space-y-4">
              <p>
                QR leído. Evento: <strong className="wrap-anywhere">{event.nombre}</strong>.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={scan.isPending}
                  onClick={() => void confirm()}
                  className="min-h-11 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {scan.isPending
                    ? 'Registrando…'
                    : scan.isError
                      ? 'Reintentar asistencia'
                      : 'Confirmar asistencia'}
                </button>
                <button
                  type="button"
                  disabled={scan.isPending}
                  onClick={() => {
                    setCandidate(null)
                    scan.reset()
                  }}
                  className="min-h-11 rounded-full border border-outline px-5 py-2 text-sm text-primary"
                >
                  Descartar QR
                </button>
              </div>
            </div>
          )}
          {scan.isError && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {errorMessage(scan.error)}
            </p>
          )}
          {scan.isSuccess && (
            <div className="space-y-4">
              <output className="block rounded-xl bg-primary-container p-4 text-on-container">
                Asistencia confirmada: {scan.data.estudiante.nombre}.
              </output>
              <button
                type="button"
                onClick={() => {
                  setCandidate(null)
                  scan.reset()
                }}
                className="min-h-11 rounded-full border border-primary/40 px-5 py-2 text-sm text-primary"
              >
                Escanear otro QR
              </button>
            </div>
          )}
        </section>
      )}
      {attendees.data && (
        <section aria-labelledby="attendees-title">
          <h3 id="attendees-title" className="mb-4 text-xl font-semibold">
            Asistentes
          </h3>
          <p className="mb-4 text-sm text-muted">
            {attendees.data.length} inscritos · {present} presentes ·{' '}
            {attendees.data.length - present} pendientes
          </p>
          {attendees.data.length ? (
            <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
              {attendees.data.map((person) => (
                <li key={person.usuarioId} className="min-w-0 rounded-2xl bg-card p-5">
                  <p className="font-semibold wrap-anywhere">{person.nombre}</p>
                  {person.email && (
                    <p className="mt-1 text-sm wrap-anywhere text-muted">{person.email}</p>
                  )}
                  <p className="mt-3 text-sm text-primary">
                    {person.presente ? 'Presente' : 'Asistencia pendiente'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-outline bg-white p-6 text-sm text-muted">
              Todavía no hay inscritos en este evento.
            </p>
          )}
        </section>
      )}
    </section>
  )
}
