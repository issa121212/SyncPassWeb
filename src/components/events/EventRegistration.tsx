import { useRef } from 'react'
import { useEventRegistration } from '../../hooks/useEventRegistration'
import { registrationBlockedReason } from '../../types/inscripcion'
import type { Evento } from '../../types/evento'
import { errorMessage } from '../../services/http'

export default function EventRegistration({ event }: { event: Evento }) {
  const registration = useEventRegistration()
  const sending = useRef(false)
  const blocked = registrationBlockedReason(event)

  async function register() {
    if (sending.current || blocked || !event.qrContenido) return
    sending.current = true
    try {
      await registration.mutateAsync(event.qrContenido)
    } catch {
      // Preserve the server's rejection beside the action that triggered it.
      sending.current = false
    }
  }

  return (
    <footer className="mt-5 border-t border-primary/15 pt-4">
      {event.inscrito ? (
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-primary">Ya estás inscrito</p>
          <p className="text-muted">
            {event.esPresente ? 'Asistencia registrada.' : 'Asistencia pendiente de registrar.'}
          </p>
          {registration.isSuccess && <output className="block">Inscripción confirmada.</output>}
        </div>
      ) : (
        <>
          <button
            type="button"
            disabled={Boolean(blocked) || registration.isPending}
            aria-busy={registration.isPending}
            aria-label={`Inscribirme en ${event.nombre}`}
            aria-describedby={blocked ? `registration-${event.id}-reason` : undefined}
            onClick={() => void register()}
            className="min-h-11 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {registration.isPending ? 'Inscribiendo…' : 'Inscribirme'}
          </button>
          {blocked && (
            <p id={`registration-${event.id}-reason`} className="mt-3 text-sm leading-6 text-muted">
              {blocked}
            </p>
          )}
        </>
      )}
      {registration.isError && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {errorMessage(registration.error)}
        </p>
      )}
    </footer>
  )
}
