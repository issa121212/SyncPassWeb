// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EventsPage from './EventsPage'
import QueryProvider from '../providers/QueryProvider'
import { useIdentity } from '../auth/useIdentity'
import { createHttpClient } from '../services/http'
import { eventDefaults, eventPayload } from '../types/evento'
import type { Evento } from '../types/evento'
vi.mock('../auth/useIdentity', () => ({ useIdentity: vi.fn() }))
vi.mock('../hooks/useHttpClient', () => ({
  useHttpClient: () => createHttpClient('https://api.example/', 'synthetic-test-token'),
}))
const project = {
  id: 4,
  nombre: 'Huerto comunitario',
  descripcion: null,
  areaTematica: null,
  unidadVecinal: null,
  fechaInicio: null,
  fechaFin: null,
  estado: 'PLANIFICADO',
  responsable: { id: 2, nombre: 'Ana', email: null },
}
const initial: Evento = {
  ...eventPayload({
    ...eventDefaults(),
    proyectoId: '4',
    nombre: 'Taller de riego',
    fecha: '2026-12-03',
    hora: '09:30',
  }),
  id: 7,
  proyectoNombre: project.nombre,
  inscritos: 0,
  presentes: 0,
  qrContenido: 'EVENTO_7',
  inscrito: false,
  esPresente: false,
  encuestaRespondida: false,
}
let events: Evento[]
let conflict: boolean
let readError: boolean
let writeError: boolean
let resolveRead: (() => void) | undefined
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status })
beforeEach(() => {
  events = [{ ...initial }]
  conflict = false
  readError = false
  writeError = false
  resolveRead = undefined
  vi.mocked(useIdentity).mockReturnValue({
    name: 'Ana',
    roles: ['DOCENTE'],
    role: 'DOCENTE',
    roleLabel: 'Docente',
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value() {
      this.setAttribute('open', '')
    },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value() {
      this.removeAttribute('open')
    },
  })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: URL, options: RequestInit) => {
      if (url.pathname === '/api/proyectos')
        return json([
          project,
          {
            ...project,
            id: 5,
            nombre: 'Proyecto ajeno',
            responsable: { ...project.responsable, id: 3 },
          },
        ])
      if (url.pathname === '/api/usuarios/me') return json({ id: 2, nombre: 'Ana' })
      if (options.method === 'GET') {
        if (resolveRead)
          await new Promise<void>((resolve) => {
            resolveRead = resolve
          })
        return readError ? json({}, 503) : json(events)
      }
      if (writeError)
        return json({ mensaje: 'Datos inválidos', detalles: { nombre: 'Revisa el nombre' } }, 400)
      if (options.method === 'DELETE') {
        if (conflict)
          return json({ mensaje: 'El evento tiene historial; debe cancelarse, no eliminarse' }, 409)
        events = events.filter((event) => event.id !== Number(url.pathname.split('/').pop()))
        return new Response(null, { status: 204 })
      }
      const body = JSON.parse(String(options.body))
      const event = {
        ...initial,
        ...body,
        id: options.method === 'POST' ? 8 : Number(url.pathname.split('/').pop()),
      }
      events = [...events.filter((item) => item.id !== event.id), event]
      return json(event, options.method === 'POST' ? 201 : 200)
    }),
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const mount = () =>
  render(
    <QueryProvider>
      <EventsPage />
    </QueryProvider>,
  )
describe('gestión de eventos con HTTP y React Query', () => {
  it('crea, edita y elimina con confirmación, nombres de proyecto y fecha/hora separadas', async () => {
    const user = userEvent.setup()
    mount()
    await user.click(await screen.findByRole('button', { name: 'Nuevo evento' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByRole('option', { name: 'Proyecto ajeno' })).toBeNull()
    await user.selectOptions(within(dialog).getByLabelText('Proyecto *'), '4')
    await user.type(within(dialog).getByLabelText('Nombre del evento *'), 'Nuevo taller')
    await user.type(within(dialog).getByLabelText('Fecha *'), '2026-12-04')
    await user.type(within(dialog).getByLabelText('Hora *'), '10:45')
    await user.click(within(dialog).getByRole('button', { name: 'Crear evento' }))
    await screen.findByText('Evento creado correctamente.')
    expect(events.find((event) => event.id === 8)?.fechaHora).toBe('2026-12-04T10:45')
    await user.click(screen.getByRole('button', { name: 'Editar Nuevo taller' }))
    await user.selectOptions(screen.getByLabelText('Estado'), 'CANCELADO')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await screen.findByText('Evento actualizado correctamente.')
    expect(events.some((event) => event.estado === 'CANCELADO')).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Eliminar Nuevo taller' }))
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar evento' }),
    )
    await screen.findByText('Evento eliminado correctamente.')
    expect(screen.queryByRole('heading', { name: 'Nuevo taller' })).toBeNull()
  })
  it('muestra validación antes de enviar y conserva errores del backend en el formulario', async () => {
    const user = userEvent.setup()
    mount()
    await user.click(await screen.findByRole('button', { name: 'Nuevo evento' }))
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))
    await screen.findByText('Ingresa el nombre del evento.')
    expect(events).toHaveLength(1)
    await user.selectOptions(screen.getByLabelText('Proyecto *'), '4')
    await user.type(screen.getByLabelText('Nombre del evento *'), 'Nuevo')
    await user.type(screen.getByLabelText('Fecha *'), '2026-12-04')
    await user.type(screen.getByLabelText('Hora *'), '10:45')
    writeError = true
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))
    await screen.findByText('Revisa el nombre')
    expect(screen.getByRole('alert').textContent).toContain('Datos inválidos')
    expect(screen.getByRole('dialog')).toBeTruthy()
  })
  it('muestra conflicto si se agregó historial antes de confirmar la eliminación', async () => {
    const user = userEvent.setup()
    mount()
    await user.click(await screen.findByRole('button', { name: 'Eliminar Taller de riego' }))
    conflict = true
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar evento' }),
    )
    expect((await screen.findByRole('alert')).textContent).toContain('debe cancelarse')
    expect(events).toHaveLength(1)
  })
  it('bloquea eliminación con historial y valida el cupo existente', async () => {
    events = [{ ...initial, inscritos: 3 }]
    const user = userEvent.setup()
    mount()
    const remove = await screen.findByRole('button', { name: 'Eliminar Taller de riego' })
    expect((remove as HTMLButtonElement).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Editar Taller de riego' }))
    await user.clear(screen.getByLabelText('Cupos (0 = sin límite) *'))
    await user.type(screen.getByLabelText('Cupos (0 = sin límite) *'), '2')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await screen.findByText('El cupo no puede ser menor que las inscripciones existentes.')
    expect(events[0]?.cupos).toBe(0)
  })
  it.each(['VOLUNTARIO', 'PARTICIPANTE'] as const)(
    'permite lectura a %s sin consultar gestión ni mostrar acciones',
    async (role) => {
      vi.mocked(useIdentity).mockReturnValue({ name: 'Ana', roles: [role], role, roleLabel: role })
      mount()
      await screen.findByRole('heading', { name: 'Taller de riego' })
      expect(screen.queryByRole('button', { name: 'Nuevo evento' })).toBeNull()
      expect(screen.queryByRole('button', { name: 'Editar Taller de riego' })).toBeNull()
      expect(
        vi.mocked(fetch).mock.calls.every(([url]) => String(url).endsWith('/api/eventos')),
      ).toBe(true)
    },
  )
  it('oculta gestión de proyectos ajenos a un docente', async () => {
    events = [{ ...initial, proyectoId: 5 }]
    mount()
    await screen.findByRole('button', { name: 'Nuevo evento' })
    expect(screen.queryByRole('button', { name: 'Editar Taller de riego' })).toBeNull()
  })
  it('muestra carga y lista vacía, y distingue errores de lectura', async () => {
    resolveRead = () => {}
    events = []
    mount()
    await screen.findByText('Cargando…')
    await waitFor(() => expect(resolveRead).toBeTypeOf('function'))
    resolveRead?.()
    resolveRead = undefined
    await screen.findByText('Todavía no hay eventos')
    readError = true
    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }))
    expect((await screen.findByRole('alert')).textContent).toContain(
      'El servidor no está disponible',
    )
  })
})
