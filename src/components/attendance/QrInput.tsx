import { useEffect, useRef, useState } from 'react'
function Camera({ onRead }: { onRead: (content: string) => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const callback = useRef(onRead)
  const supported = Boolean(window.isSecureContext && navigator.mediaDevices?.getUserMedia)
  const [error, setError] = useState(
    supported
      ? ''
      : 'La cámara necesita HTTPS o localhost y un navegador compatible. Puedes seleccionar una imagen del QR.',
  )
  useEffect(() => {
    callback.current = onRead
  }, [onRead])
  useEffect(() => {
    const controller = new AbortController()
    if (!supported) return () => controller.abort()
    void import('../../services/qrReader')
      .then(async (reader) => {
        if (controller.signal.aborted || !video.current) return
        try {
          await reader.startQrCamera(
            video.current,
            (content) => callback.current(content),
            controller.signal,
          )
        } catch (cause) {
          if (!controller.signal.aborted) setError(reader.cameraError(cause))
        }
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError('No se pudo cargar el lector. Inténtalo nuevamente.')
      })
    return () => controller.abort()
  }, [supported])
  return (
    <div className="space-y-3">
      <video
        ref={video}
        muted
        playsInline
        autoPlay
        aria-label="Vista de la cámara para leer el QR"
        className="aspect-video w-full rounded-xl bg-black object-cover"
      />
      {error ? (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      ) : (
        <output className="block text-sm text-muted">
          Apunta la cámara al QR del participante.
        </output>
      )}
    </div>
  )
}
export default function QrInput({
  onRead,
  disabled,
}: {
  onRead: (content: string) => void
  disabled: boolean
}) {
  const [camera, setCamera] = useState(false)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState('')
  const mounted = useRef(true)
  const readingRef = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  async function readFile(file?: File) {
    if (!file || readingRef.current || disabled) return
    readingRef.current = true
    setReading(true)
    setCamera(false)
    setError('')
    try {
      const { readQrImage } = await import('../../services/qrReader')
      const content = await readQrImage(file)
      if (mounted.current) onRead(content)
    } catch (cause) {
      if (mounted.current)
        setError(cause instanceof Error ? cause.message : 'No se pudo leer la imagen.')
    } finally {
      readingRef.current = false
      if (mounted.current) setReading(false)
    }
  }
  return (
    <div className="space-y-4">
      {camera && !disabled && (
        <Camera
          onRead={(content) => {
            setCamera(false)
            onRead(content)
          }}
        />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled || reading}
          onClick={() => {
            setError('')
            setCamera((value) => !value)
          }}
          className="min-h-11 rounded-full border border-primary/40 px-5 py-2 text-sm text-primary disabled:opacity-60"
        >
          {camera ? 'Detener cámara' : 'Abrir cámara'}
        </button>
        <div className="min-w-0 flex-1">
          <label htmlFor="qr-image" className="mb-2 block text-sm font-medium">
            Leer una imagen del QR
          </label>
          <input
            id="qr-image"
            type="file"
            accept="image/*"
            disabled={disabled || reading}
            className="min-h-11 w-full min-w-0 text-sm file:mr-3 file:rounded-full file:border file:border-outline file:bg-white file:px-3 file:py-2"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              void readFile(file)
            }}
          />
        </div>
      </div>
      {reading && <output>Leyendo imagen…</output>}
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  )
}
