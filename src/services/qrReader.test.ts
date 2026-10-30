// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startQrCamera, readQrImage, cameraError } from './qrReader'
const mocks = vi.hoisted(() => ({ stream: vi.fn(), image: vi.fn() }))
vi.mock('@zxing/browser', () => ({
  BrowserQRCodeReader: class {
    decodeFromStream = mocks.stream
    decodeFromImageUrl = mocks.image
  },
}))
let track: { stop: ReturnType<typeof vi.fn> }
let stream: MediaStream
let controls: { stop: ReturnType<typeof vi.fn> }
beforeEach(() => {
  track = { stop: vi.fn() }
  controls = { stop: vi.fn() }
  stream = { getTracks: () => [track] } as unknown as MediaStream
  mocks.stream.mockReset().mockResolvedValue(controls)
  mocks.image.mockReset().mockResolvedValue({ getText: () => 'ESTUDIANTE_31' })
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) } })
})
afterEach(() => vi.unstubAllGlobals())
describe('ciclo de vida del lector QR', () => {
  it('detiene cámara y lectura al cancelar', async () => {
    const controller = new AbortController()
    const video = document.createElement('video')
    await startQrCamera(video, vi.fn(), controller.signal)
    controller.abort()
    expect(track.stop).toHaveBeenCalled()
    expect(controls.stop).toHaveBeenCalled()
    expect(video.srcObject).toBeNull()
  })
  it('libera un permiso resuelto después de salir de la pantalla', async () => {
    let resolve!: (value: MediaStream) => void
    vi.mocked(navigator.mediaDevices.getUserMedia).mockReturnValue(
      new Promise<MediaStream>((done) => {
        resolve = done
      }),
    )
    const controller = new AbortController()
    const pending = startQrCamera(document.createElement('video'), vi.fn(), controller.signal)
    controller.abort()
    resolve(stream)
    await pending
    expect(track.stop).toHaveBeenCalled()
    expect(mocks.stream).not.toHaveBeenCalled()
  })
  it('detiene controles resueltos después de cancelar el inicio', async () => {
    let resolve!: (value: typeof controls) => void
    mocks.stream.mockReturnValue(
      new Promise<typeof controls>((done) => {
        resolve = done
      }),
    )
    const controller = new AbortController()
    const pending = startQrCamera(document.createElement('video'), vi.fn(), controller.signal)
    await vi.waitFor(() => expect(mocks.stream).toHaveBeenCalled())
    controller.abort()
    resolve(controls)
    await pending
    expect(track.stop).toHaveBeenCalled()
    expect(controls.stop).toHaveBeenCalled()
  })
  it('entrega una sola lectura y apaga el stream al detectar un QR', async () => {
    const onRead = vi.fn()
    await startQrCamera(document.createElement('video'), onRead, new AbortController().signal)
    const callback = mocks.stream.mock.calls[0]?.[2]
    callback({ getText: () => 'ESTUDIANTE_31' })
    callback({ getText: () => 'ESTUDIANTE_31' })
    expect(onRead).toHaveBeenCalledExactlyOnceWith('ESTUDIANTE_31')
    expect(track.stop).toHaveBeenCalled()
  })
  it('libera la cámara si falla el lector', async () => {
    mocks.stream.mockRejectedValue(new Error('decode'))
    await expect(
      startQrCamera(document.createElement('video'), vi.fn(), new AbortController().signal),
    ).rejects.toThrow('decode')
    expect(track.stop).toHaveBeenCalled()
  })
  it('no abre cámara si ya se canceló', async () => {
    const controller = new AbortController()
    controller.abort()
    await startQrCamera(document.createElement('video'), vi.fn(), controller.signal)
    expect(navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled()
  })
  it('decodifica la imagen local y revoca su URL temporal', async () => {
    const revoke = vi.fn()
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:local-qr'),
      revokeObjectURL: revoke,
    })
    expect(await readQrImage(new File(['qr'], 'qr.png', { type: 'image/png' }))).toBe(
      'ESTUDIANTE_31',
    )
    expect(revoke).toHaveBeenCalledWith('blob:local-qr')
    mocks.image.mockRejectedValue(new Error('not found'))
    await expect(readQrImage(new File(['qr'], 'qr.png', { type: 'image/png' }))).rejects.toThrow(
      'No se encontró un QR legible',
    )
    expect(revoke).toHaveBeenCalledTimes(2)
  })
  it('rechaza archivos fuera de tipo o tamaño antes de decodificar', async () => {
    await expect(readQrImage(new File(['data'], 'qr.txt', { type: 'text/plain' }))).rejects.toThrow(
      'Selecciona una imagen',
    )
    const file = new File(['image'], 'qr.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 })
    await expect(readQrImage(file)).rejects.toThrow('hasta 10 MB')
    expect(mocks.image).not.toHaveBeenCalled()
  })
  it.each(['NotAllowedError', 'NotFoundError', 'NotReadableError'])(
    'ofrece recuperación ante %s',
    (name) => {
      expect(cameraError(new DOMException('camera', name))).toContain('imagen')
    },
  )
})
