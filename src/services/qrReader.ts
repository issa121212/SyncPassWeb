// This module is loaded only when the user chooses to read a QR.
import { BrowserQRCodeReader } from '@zxing/browser'
export function cameraError(error: unknown): string {
  const name = error && typeof error === 'object' && 'name' in error ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'No se autorizó la cámara. Revisa el permiso del navegador o selecciona una imagen del QR.'
  if (name === 'NotFoundError')
    return 'No se encontró una cámara. Puedes seleccionar una imagen del QR.'
  if (name === 'NotReadableError')
    return 'La cámara está ocupada. Cierra otras aplicaciones o selecciona una imagen.'
  return 'No se pudo abrir la cámara. Inténtalo nuevamente o selecciona una imagen del QR.'
}
export async function startQrCamera(
  video: HTMLVideoElement,
  onRead: (content: string) => void,
  signal: AbortSignal,
) {
  let stream: MediaStream | undefined
  let controls: { stop: () => void } | undefined
  let stopped = false
  const stop = () => {
    stopped = true
    signal.removeEventListener('abort', stop)
    controls?.stop()
    stream?.getTracks().forEach((track) => track.stop())
    video.srcObject = null
  }
  signal.addEventListener('abort', stop, { once: true })
  try {
    if (signal.aborted) {
      stop()
      return stop
    }
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })
    if (stopped || signal.aborted) {
      stop()
      return stop
    }
    controls = await new BrowserQRCodeReader().decodeFromStream(stream, video, (result) => {
      if (!result || stopped) return
      stop()
      onRead(result.getText())
    })
    if (stopped) stop()
    return stop
  } catch (error) {
    stop()
    throw error
  }
}
export async function readQrImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024)
    throw new Error('Selecciona una imagen de hasta 10 MB.')
  const url = URL.createObjectURL(file)
  try {
    const result = await new BrowserQRCodeReader().decodeFromImageUrl(url)
    return result.getText()
  } catch {
    throw new Error('No se encontró un QR legible. Prueba con una imagen más nítida.')
  } finally {
    URL.revokeObjectURL(url)
  }
}
