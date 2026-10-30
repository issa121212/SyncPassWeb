// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import EventsPage from './EventsPage'
import RegistrationsPage from './RegistrationsPage'
import QueryProvider from '../providers/QueryProvider'
import { useIdentity } from '../auth/useIdentity'
import { createHttpClient } from '../services/http'
import { eventDefaults, eventPayload } from '../types/evento'
import type { Evento } from '../types/evento'

vi.mock('../auth/useIdentity', () => ({ useIdentity: vi.fn() }))
vi.mock('../hooks/useHttpClient', () => ({
  useHttpClient: () => createHttpClient('https://api.example/', 'synthetic-test-token'),
}))
const original: Evento = {
  ...eventPayload({
    ...eventDefaults(),
    proyectoId: '1',
    nombre: 'Taller comunitario',
    fecha: '2026-12-04',
    hora: '14:00',
  }),
  id: 1,
  proyectoNombre: 'Comunidad',
  inscritos: 0,
  presentes: 0,
  qrContenido: 'EVENTO_1',
  inscrito: false,
  esPresente: false,
  encuestaRespondida: false,
}
let event: Evento
let status: number
let posts: number
let reads: number
let confirmRegistration: boolean
beforeEach(() => {
  event = { ...original }
  status = 200
  posts = 0
  reads = 0
  confirmRegistration = true
  vi.mocked(useIdentity).mockReturnValue({
    name: 'Ana',
    roles: ['PARTICIPANTE'],
    role: 'PARTICIPANTE',
    roleLabel: 'Participante',
  })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: URL, options: RequestInit) => {
      if (options.method === 'GET') {
        reads++
        return new Response(JSON.stringify([event]), { status: 200 })
      }
      posts++
      expect(url.pathname).toBe('/api/eventos/inscribirse')
      expect(JSON.parse(String(options.body))).toEqual({ codigoQr: 'EVENTO_1' })
      if (status !== 200) {
        if (status === 422) event = { ...event, cupos: 1, inscritos: 1 }
        return new Response(
          JSON.stringify({
            mensaje: status === 403 ? 'Sin permiso' : 'El evento no tiene cupos disponibles',
          }),
          { status },
        )
      }
      event = { ...event, inscrito: confirmRegistration, inscritos: event.inscritos + 1 }
      return new Response(JSON.stringify(event), { status: 200 })
    }),
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
const mount = (page = <EventsPage />) =>
  render(
    <MemoryRouter>
      <QueryProvider>{page}</QueryProvider>
    </MemoryRouter>,
  )

describe('inscripciones de participantes', () => {
  it('no anuncia éxito si la respuesta no confirma la inscripción', async () => {
    confirmRegistration = false
    mount()
    await userEvent.click(
      await screen.findByRole('button', { name: 'Inscribirme en Taller comunitario' }),
    )
    expect((await screen.findByRole('alert')).textContent).toContain('no confirmó tu inscripción')
    expect(screen.queryByText('Inscripción confirmada.')).toBeNull()
  })
  it('inscribe una sola vez, muestra la confirmación y mantiene asistencia pendiente', async () => {
    const user = userEvent.setup()
    mount()
    await user.dblClick(
      await screen.findByRole('button', { name: 'Inscribirme en Taller comunitario' }),
    )
    await screen.findByText('Inscripción confirmada.')
    expect(posts).toBe(1)
    expect(event.esPresente).toBe(false)
    expect(screen.getByText('Asistencia pendiente de registrar.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Inscribirme en Taller comunitario' })).toBeNull()
  })
  it.each([
    { estado: 'CANCELADO' as const },
    { estado: 'FINALIZADO' as const },
    { cupos: 1, inscritos: 1 },
    { qrContenido: null },
  ])('bloquea la inscripción cuando no corresponde: %j', async (change) => {
    event = { ...event, ...change }
    mount()
    const button = await screen.findByRole('button', { name: 'Inscribirme en Taller comunitario' })
    expect((button as HTMLButtonElement).disabled).toBe(true)
    expect(posts).toBe(0)
  })
  it('conserva rechazo por cupos concurrentes y actualiza la disponibilidad sin confirmar inscripción', async () => {
    status = 422
    mount()
    await userEvent.click(
      await screen.findByRole('button', { name: 'Inscribirme en Taller comunitario' }),
    )
    expect((await screen.findByRole('alert')).textContent).toContain('no tiene cupos')
    await screen.findByText('No quedan cupos disponibles.')
    expect(screen.queryByText('Inscripción confirmada.')).toBeNull()
    expect(posts).toBe(1)
  })
  it('no reintenta escrituras rechazadas por permisos', async () => {
    status = 403
    mount()
    await userEvent.click(
      await screen.findByRole('button', { name: 'Inscribirme en Taller comunitario' }),
    )
    expect((await screen.findByRole('alert')).textContent).toContain('Sin permiso')
    expect(posts).toBe(1)
  })
  it('mis inscripciones muestra únicamente las del usuario y la asistencia confirmada por API', async () => {
    event = { ...event, inscrito: true, esPresente: true }
    mount(<RegistrationsPage />)
    await screen.findByRole('heading', { name: 'Taller comunitario' })
    expect(screen.getByText('Asistencia registrada.')).toBeTruthy()
    expect(posts).toBe(0)
  })
  it('distingue la lista de inscripciones vacía', async () => {
    mount(<RegistrationsPage />)
    await screen.findByText('Todavía no tienes inscripciones')
    expect(screen.queryByRole('heading', { name: 'Taller comunitario' })).toBeNull()
  })
  it('un docente no accede a mis inscripciones ni consulta la API desde esa página', () => {
    vi.mocked(useIdentity).mockReturnValue({
      name: 'Ana',
      roles: ['DOCENTE'],
      role: 'DOCENTE',
      roleLabel: 'Docente',
    })
    mount(<RegistrationsPage />)
    expect(screen.getByRole('heading', { name: 'Sección no disponible' })).toBeTruthy()
    expect(reads).toBe(0)
  })
})
