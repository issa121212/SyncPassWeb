import { describe, expect, it } from 'vitest'
import {
  canManageProject,
  canDeleteEvent,
  eventDefaults,
  eventFormSchema,
  eventPayload,
  eventSchema,
} from './evento'
import { projectSchema } from './proyecto'
const valid = {
  ...eventDefaults(),
  proyectoId: '4',
  nombre: ' Taller ',
  fecha: '2026-12-03',
  hora: '09:30',
}
describe('contrato de eventos y permisos del backend', () => {
  it('combina fecha y hora locales sin desplazarlas y conserva segundos al editar', () => {
    const payload = eventPayload(eventFormSchema.parse(valid))
    expect(payload).toMatchObject({
      proyectoId: 4,
      nombre: 'Taller',
      fechaHora: '2026-12-03T09:30',
      cupos: 0,
      latitud: null,
      longitud: null,
      radioMetros: 200,
      descripcion: null,
    })
    const event = eventSchema.parse({
      ...payload,
      id: 9,
      proyectoNombre: 'Huerto',
      inscritos: 0,
      presentes: 0,
      qrContenido: 'EVENTO_7',
      inscrito: false,
      esPresente: false,
      encuestaRespondida: false,
      fechaHora: '2026-12-03T09:30:45.123',
    })
    expect(eventPayload(eventDefaults(event)).fechaHora).toBe(event.fechaHora)
    expect(eventSchema.safeParse({ ...event, fechaHora: '2026-12-03T09:30:00Z' }).success).toBe(
      false,
    )
  })
  it.each([
    { nombre: ' ' },
    { nombre: 'a'.repeat(161) },
    { proyectoId: '' },
    { proyectoId: '1.5' },
    { fecha: '2026-02-30' },
    { fecha: '' },
    { hora: '24:00' },
    { hora: '' },
    { cupos: '-1' },
    { cupos: '2.5' },
    { cupos: '' },
    { cupos: '2147483648' },
    { latitud: '91', longitud: '0' },
    { latitud: '0', longitud: '-181' },
    { latitud: '0' },
    { longitud: '0' },
    { radioMetros: '0' },
    { radioMetros: '50001' },
    { estado: 'PLANIFICADO' },
    { recinto: 'a'.repeat(161) },
    { direccion: 'a'.repeat(241) },
    { descripcion: 'a'.repeat(4001) },
  ])('rechaza datos fuera del contrato: %j', (change) => {
    expect(eventFormSchema.safeParse({ ...valid, ...change }).success).toBe(false)
  })
  it('acepta coordenadas cero y cupos ilimitados', () => {
    expect(
      eventPayload(eventFormSchema.parse({ ...valid, latitud: '0', longitud: '0' })),
    ).toMatchObject({ latitud: 0, longitud: 0, cupos: 0 })
  })
  it('exige rol y propiedad y permite administración sobre cualquier proyecto', () => {
    const project = projectSchema.parse({
      id: 4,
      nombre: 'Huerto',
      descripcion: null,
      areaTematica: null,
      unidadVecinal: null,
      fechaInicio: null,
      fechaFin: null,
      estado: 'PLANIFICADO',
      responsable: { id: 2, nombre: 'Ana', email: null },
    })
    expect(canManageProject(project, ['DOCENTE'], 2)).toBe(true)
    expect(canManageProject(project, ['DOCENTE'], 3)).toBe(false)
    expect(canManageProject(project, ['DOCENTE'])).toBe(false)
    expect(canManageProject(project, ['VOLUNTARIO'], 2)).toBe(false)
    expect(canManageProject(project, ['PARTICIPANTE'], 2)).toBe(false)
    expect(canManageProject(project, ['ADMIN'])).toBe(true)
  })
  it('bloquea eliminación con inscripciones o presentes', () => {
    const event = eventSchema.parse({
      ...eventPayload(valid),
      id: 1,
      proyectoNombre: 'Huerto',
      inscritos: 0,
      presentes: 0,
      qrContenido: 'EVENTO_7',
      inscrito: false,
      esPresente: false,
      encuestaRespondida: false,
    })
    expect(canDeleteEvent(event)).toBe(true)
    expect(canDeleteEvent({ ...event, inscritos: 1 })).toBe(false)
    expect(canDeleteEvent({ ...event, presentes: 1 })).toBe(false)
  })
})
