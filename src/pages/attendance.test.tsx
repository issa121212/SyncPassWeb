// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AttendancePage from './AttendancePage'
import RegistrationsPage from './RegistrationsPage'
import QueryProvider from '../providers/QueryProvider'
import { useIdentity } from '../auth/useIdentity'
import { createHttpClient } from '../services/http'
import { eventDefaults, eventPayload } from '../types/evento'
import type { Evento } from '../types/evento'
import type { Asistente } from '../types/asistencia'
import { readQrImage, startQrCamera } from '../services/qrReader'
vi.mock('../auth/useIdentity', () => ({ useIdentity: vi.fn() }))
vi.mock('../hooks/useHttpClient', () => ({
  useHttpClient: () => createHttpClient('https://api.example/', 'synthetic-test-token'),
}))
vi.mock('../services/qrReader', () => ({
  readQrImage: vi.fn(),
  startQrCamera: vi.fn(),
  cameraError: () => 'No se autorizó la cámara. Selecciona una imagen del QR.',
}))
const initial: Evento = {
  ...eventPayload({
    ...eventDefaults(),
    proyectoId: '4',
    nombre: 'Taller comunitario',
    fecha: '2026-12-03',
    hora: '09:30',
  }),
  id: 7,
  proyectoNombre: 'Huerto',
  inscritos: 1,
  presentes: 0,
  qrContenido: 'EVENTO_7',
  inscrito: false,
  esPresente: false,
  encuestaRespondida: false,
}
const person: Asistente = {
  usuarioId: 31,
  nombre: 'Participante de prueba',
  email: null,
  inscrito: true,
  presente: false,
  marcadoEn: null,
}
let events: Evento[]
let attendees: Asistente[]
let status: number
let readStatus: number
let qrStatus: number
let responseConfirmed: boolean
let responseEvent: number
let releaseWrite: (() => void) | undefined
let delayWrite: boolean
let cameraCallback: ((content: string) => void) | undefined
let cameraSignal: AbortSignal | undefined
beforeEach(() => {
  events = [{ ...initial }, { ...initial, id: 8, proyectoId: 5, nombre: 'Otro taller' }]
  attendees = [{ ...person }]
  status = 200
  readStatus = 200
  qrStatus = 200
  responseConfirmed = true
  responseEvent = 7
  delayWrite = false
  releaseWrite = undefined
  cameraCallback = undefined
  cameraSignal = undefined
  vi.mocked(useIdentity).mockReturnValue({
    name: 'Recepción',
    roles: ['VOLUNTARIO'],
    role: 'VOLUNTARIO',
    roleLabel: 'Recepción',
  })
  vi.mocked(readQrImage).mockReset().mockResolvedValue('ESTUDIANTE_31')
  vi.mocked(startQrCamera)
    .mockReset()
    .mockImplementation(async (_video, onRead, signal) => {
      cameraCallback = onRead
      cameraSignal = signal
      return () => {}
    })
  vi.stubGlobal('isSecureContext', true)
  vi.stubGlobal('navigator', { ...navigator, mediaDevices: { getUserMedia: vi.fn() } })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: URL, options: RequestInit) => {
      if (url.pathname === '/api/usuarios/me/qr')
        return new Response(
          JSON.stringify(
            qrStatus === 200 ? { contenido: 'ESTUDIANTE_31' } : { mensaje: 'QR no disponible' },
          ),
          { status: qrStatus },
        )
      if (url.pathname === '/api/usuarios/me') return Response.json({ id: 2, nombre: 'Docente' })
      if (url.pathname === '/api/proyectos')
        return Response.json([
          {
            id: 4,
            nombre: 'Huerto',
            descripcion: null,
            areaTematica: null,
            unidadVecinal: null,
            fechaInicio: null,
            fechaFin: null,
            estado: 'PLANIFICADO',
            responsable: { id: 2, nombre: 'Docente', email: null },
          },
          {
            id: 5,
            nombre: 'Ajeno',
            descripcion: null,
            areaTematica: null,
            unidadVecinal: null,
            fechaInicio: null,
            fechaFin: null,
            estado: 'PLANIFICADO',
            responsable: { id: 3, nombre: 'Otra persona', email: null },
          },
        ])
      if (url.pathname === '/api/eventos') return Response.json(events)
      if (options.method === 'GET')
        return new Response(
          JSON.stringify(
            readStatus === 200 ? attendees : { mensaje: 'No tienes permiso para este evento' },
          ),
          { status: readStatus },
        )
      if (delayWrite)
        await new Promise<void>((resolve) => {
          releaseWrite = resolve
        })
      if (status !== 200)
        return new Response(
          JSON.stringify({
            mensaje: status === 503 ? 'internal' : 'El evento no tiene cupos disponibles',
          }),
          { status },
        )
      if (responseConfirmed)
        attendees = [{ ...person, presente: true, marcadoEn: '2026-12-03T12:30:00Z' }]
      return Response.json({
        id: 12,
        eventoId: responseEvent,
        estudiante: { id: 31, nombre: person.nombre, email: null },
        esPresente: responseConfirmed,
        marcadoEn: '2026-12-03T12:30:00Z',
      })
    }),
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const mount = (page = <AttendancePage />) =>
  render(
    <MemoryRouter>
      <QueryProvider>{page}</QueryProvider>
    </MemoryRouter>,
  )
const posts = () => vi.mocked(fetch).mock.calls.filter(([, options]) => options?.method === 'POST')
async function selectEvent(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(await screen.findByLabelText('Evento'), '7')
  await screen.findByRole('heading', { name: 'Registrar asistencia' })
}
async function upload(user: ReturnType<typeof userEvent.setup>) {
  await user.upload(
    screen.getByLabelText('Leer una imagen del QR'),
    new File(['image'], 'qr.png', { type: 'image/png' }),
  )
  await screen.findByRole('button', { name: 'Confirmar asistencia' })
}
describe('recepción de asistencia con HTTP y React Query', () => {
  it('lee una imagen, confirma una sola vez y actualiza asistentes sin enviar un usuario elegido por el cliente', async () => {
    const user = userEvent.setup()
    mount()
    await selectEvent(user)
    await upload(user)
    expect(posts()).toHaveLength(0)
    await user.dblClick(screen.getByRole('button', { name: 'Confirmar asistencia' }))
    await screen.findByText('Asistencia confirmada: Participante de prueba.')
    expect(posts()).toHaveLength(1)
    expect(String(posts()[0]?.[0])).toBe('https://api.example/api/eventos/7/asistencias/escanear')
    expect(JSON.parse(String(posts()[0]?.[1]?.body))).toEqual({
      codigoQr: 'ESTUDIANTE_31',
      clientUuid: expect.any(String),
      marcadoEn: expect.any(String),
      esPresente: true,
    })
    expect(screen.getByText('1 inscritos · 1 presentes · 0 pendientes')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Escanear otro QR' })).toBeTruthy()
  })
  it('bloquea el cambio de evento y los envíos repetidos mientras registra', async () => {
    delayWrite = true
    const user = userEvent.setup()
    mount()
    await selectEvent(user)
    await upload(user)
    await user.dblClick(screen.getByRole('button', { name: 'Confirmar asistencia' }))
    await waitFor(() => expect(releaseWrite).toBeTypeOf('function'))
    expect((screen.getByLabelText('Evento') as HTMLSelectElement).disabled).toBe(true)
    expect(
      (screen.getByRole('button', { name: 'Registrando…' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    expect(posts()).toHaveLength(1)
    releaseWrite?.()
    await screen.findByText('Asistencia confirmada: Participante de prueba.')
  })
  it('reintenta con el mismo identificador después de una respuesta incierta y no reintenta automáticamente', async () => {
    status = 503
    const user = userEvent.setup()
    mount()
    await selectEvent(user)
    await upload(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar asistencia' }))
    await screen.findByText('El servidor no está disponible. Inténtalo más tarde.')
    expect(posts()).toHaveLength(1)
    status = 200
    await user.click(screen.getByRole('button', { name: 'Reintentar asistencia' }))
    await screen.findByText('Asistencia confirmada: Participante de prueba.')
    expect(posts()[1]?.[1]?.body).toBe(posts()[0]?.[1]?.body)
  })
  it('conserva el rechazo por cupos sin mostrar confirmación', async () => {
    status = 422
    const user = userEvent.setup()
    mount()
    await selectEvent(user)
    await upload(user)
    await user.click(screen.getByRole('button', { name: 'Confirmar asistencia' }))
    await screen.findByText('El evento no tiene cupos disponibles')
    expect(screen.queryByText(/Asistencia confirmada:/)).toBeNull()
    expect(screen.getByText('1 inscritos · 0 presentes · 1 pendientes')).toBeTruthy()
  })
  it.each(['EVENTO_7', 'SYNC_PASS:ASISTENCIA:8:31', 'https://example.com'])(
    'rechaza el QR incorrecto %s antes de enviarlo',
    async (content) => {
      vi.mocked(readQrImage).mockResolvedValue(content)
      const user = userEvent.setup()
      mount()
      await selectEvent(user)
      await user.upload(
        screen.getByLabelText('Leer una imagen del QR'),
        new File(['image'], 'qr.png', { type: 'image/png' }),
      )
      await screen.findByRole('alert')
      expect(posts()).toHaveLength(0)
      expect(screen.queryByRole('button', { name: 'Confirmar asistencia' })).toBeNull()
    },
  )
  it.each([false, true])(
    'no anuncia confirmación ante una respuesta incompatible: %s',
    async (wrongEvent) => {
      responseConfirmed = wrongEvent
      responseEvent = wrongEvent ? 8 : 7
      const user = userEvent.setup()
      mount()
      await selectEvent(user)
      await upload(user)
      await user.click(screen.getByRole('button', { name: 'Confirmar asistencia' }))
      await screen.findByText(/El servidor no confirmó la asistencia/)
      expect(screen.queryByText(/Asistencia confirmada:/)).toBeNull()
    },
  )
  it('cierra la cámara al cambiar de evento y descarta el QR seleccionado', async () => {
    const user = userEvent.setup()
    mount()
    await selectEvent(user)
    await user.click(screen.getByRole('button', { name: 'Abrir cámara' }))
    await waitFor(() => expect(startQrCamera).toHaveBeenCalled())
    await user.selectOptions(screen.getByLabelText('Evento'), '8')
    await screen.findByRole('heading', { name: 'Otro taller' })
    expect(cameraSignal?.aborted).toBe(true)
    expect(screen.queryByRole('button', { name: 'Confirmar asistencia' })).toBeNull()
  })
  it('pausa la cámara después de leer un QR y espera confirmación', async () => {
    const user = userEvent.setup()
    mount()
    await selectEvent(user)
    await user.click(screen.getByRole('button', { name: 'Abrir cámara' }))
    await waitFor(() => expect(cameraCallback).toBeTypeOf('function'))
    cameraCallback?.('ESTUDIANTE_31')
    await screen.findByRole('button', { name: 'Confirmar asistencia' })
    expect(cameraSignal?.aborted).toBe(true)
    expect(posts()).toHaveLength(0)
  })
  it('muestra alternativa de imagen cuando falla el permiso de cámara', async () => {
    vi.mocked(startQrCamera).mockRejectedValue(new DOMException('denied', 'NotAllowedError'))
    const user = userEvent.setup()
    mount()
    await selectEvent(user)
    await user.click(screen.getByRole('button', { name: 'Abrir cámara' }))
    await screen.findByText(/No se autorizó la cámara/)
    expect(screen.getByLabelText('Leer una imagen del QR')).toBeTruthy()
  })
  it('muestra el error de imagen y permite elegir otra', async () => {
    vi.mocked(readQrImage).mockRejectedValue(new Error('No se encontró un QR legible.'))
    const user = userEvent.setup()
    mount()
    await selectEvent(user)
    await user.upload(
      screen.getByLabelText('Leer una imagen del QR'),
      new File(['image'], 'qr.png', { type: 'image/png' }),
    )
    await screen.findByText('No se encontró un QR legible.')
    vi.mocked(readQrImage).mockResolvedValue('ESTUDIANTE_31')
    await upload(user)
  })
  it('deja consultar un evento cerrado sin controles para registrar', async () => {
    events[0] = { ...initial, estado: 'FINALIZADO' }
    const user = userEvent.setup()
    mount()
    await user.selectOptions(await screen.findByLabelText('Evento'), '7')
    await screen.findByText('Participante de prueba')
    expect(screen.queryByRole('button', { name: 'Abrir cámara' })).toBeNull()
  })
  it('distingue una lista vacía y un rechazo de permisos', async () => {
    attendees = []
    const user = userEvent.setup()
    mount()
    await selectEvent(user)
    await screen.findByText('Todavía no hay inscritos en este evento.')
    readStatus = 403
    await user.click(screen.getByRole('button', { name: 'Actualizar asistentes' }))
    await screen.findByText('No tienes permiso para este evento')
    expect(screen.queryByRole('button', { name: 'Abrir cámara' })).toBeNull()
  })
  it('limita un docente a sus proyectos', async () => {
    vi.mocked(useIdentity).mockReturnValue({
      name: 'Docente',
      roles: ['DOCENTE'],
      role: 'DOCENTE',
      roleLabel: 'Docente',
    })
    mount()
    const select = await screen.findByLabelText('Evento')
    expect(within(select).getByRole('option', { name: 'Taller comunitario — Huerto' })).toBeTruthy()
    expect(within(select).queryByRole('option', { name: /Otro taller/ })).toBeNull()
  })
  it('permite a administración seleccionar cualquier evento', async () => {
    vi.mocked(useIdentity).mockReturnValue({
      name: 'Admin',
      roles: ['ADMIN'],
      role: 'ADMIN',
      roleLabel: 'Admin',
    })
    mount()
    const select = await screen.findByLabelText('Evento')
    expect(within(select).getByRole('option', { name: /Otro taller/ })).toBeTruthy()
  })
  it('no consulta asistentes ni permite automarcación a participantes', () => {
    vi.mocked(useIdentity).mockReturnValue({
      name: 'Ana',
      roles: ['PARTICIPANTE'],
      role: 'PARTICIPANTE',
      roleLabel: 'Participante',
    })
    mount()
    expect(screen.getByRole('heading', { name: 'Sección no disponible' })).toBeTruthy()
    expect(fetch).not.toHaveBeenCalled()
  })
  it('muestra el QR personal a partir de la API en mis inscripciones', async () => {
    vi.mocked(useIdentity).mockReturnValue({
      name: 'Ana',
      roles: ['PARTICIPANTE'],
      role: 'PARTICIPANTE',
      roleLabel: 'Participante',
    })
    mount(<RegistrationsPage />)
    await screen.findByTitle('QR personal para registrar tu asistencia')
    expect(
      vi.mocked(fetch).mock.calls.some(([url]) => String(url).endsWith('/api/usuarios/me/qr')),
    ).toBe(true)
    expect(screen.queryByRole('button', { name: 'Confirmar asistencia' })).toBeNull()
    expect(posts()).toHaveLength(0)
  })
  it('permite reintentar la carga del QR sin mostrar una credencial inventada', async () => {
    qrStatus = 503
    vi.mocked(useIdentity).mockReturnValue({
      name: 'Ana',
      roles: ['PARTICIPANTE'],
      role: 'PARTICIPANTE',
      roleLabel: 'Participante',
    })
    const user = userEvent.setup()
    mount(<RegistrationsPage />)
    await screen.findByRole('alert')
    expect(screen.queryByTitle('QR personal para registrar tu asistencia')).toBeNull()
    qrStatus = 200
    await user.click(screen.getByRole('button', { name: 'Actualizar mi QR' }))
    await screen.findByTitle('QR personal para registrar tu asistencia')
  })
})
