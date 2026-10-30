import { QRCodeSVG } from 'qrcode.react'
import { usePersonalQr } from '../../hooks/useAttendance'
import { errorMessage } from '../../services/http'
export default function PersonalQr() {
  const qr = usePersonalQr()
  return (
    <section
      className="mb-7 rounded-2xl border border-outline bg-white p-5 sm:p-7"
      aria-labelledby="personal-qr-title"
    >
      <h2 id="personal-qr-title" className="mb-3 text-xl font-semibold">
        Mi QR de asistencia
      </h2>
      <p className="mb-5 text-sm leading-7 text-muted">
        Presenta este QR a recepción para que registre tu asistencia en el evento. Inscribirte no
        marca tu asistencia.
      </p>
      {qr.isPending && <output>Cargando tu QR…</output>}
      {qr.isError && (
        <p role="alert" className="mb-4 text-sm text-red-800">
          {errorMessage(qr.error)}
        </p>
      )}
      {qr.data && !qr.isError && (
        <QRCodeSVG
          value={qr.data.contenido}
          size={224}
          level="M"
          marginSize={4}
          title="QR personal para registrar tu asistencia"
          className="mx-auto h-auto max-w-full bg-white"
        />
      )}
      <button
        type="button"
        disabled={qr.isFetching}
        onClick={() => void qr.refetch()}
        className="mt-5 min-h-11 rounded-full border border-primary/40 px-5 py-2 text-sm text-primary"
      >
        {qr.isFetching ? 'Actualizando…' : 'Actualizar mi QR'}
      </button>
    </section>
  )
}
