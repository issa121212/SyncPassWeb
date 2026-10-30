import { z } from 'zod'
import type { Role } from '../auth/identity'
import type { Proyecto } from './proyecto'

export const eventStates = ['PROGRAMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'] as const
export const eventStateLabels = {
  PROGRAMADO: 'Programado',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
}
export const eventSchema = z.object({
  id: z.number().int().positive(),
  proyectoId: z.number().int().positive(),
  proyectoNombre: z.string(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  fechaHora: z.iso
    .datetime({ local: true })
    .refine((value) => !value.endsWith('Z'), 'Se esperaba fecha y hora local.'),
  cupos: z.number().int().nonnegative(),
  inscritos: z.number().int().nonnegative(),
  presentes: z.number().int().nonnegative(),
  recinto: z.string().nullable(),
  direccion: z.string().nullable(),
  latitud: z.number().nullable(),
  longitud: z.number().nullable(),
  radioMetros: z.number().int().nullable(),
  estado: z.enum(eventStates),
  qrContenido: z.string().nullable(),
  inscrito: z.boolean(),
  esPresente: z.boolean(),
  encuestaRespondida: z.boolean(),
})
export type Evento = z.infer<typeof eventSchema>
const numericText = (min: number, max: number, integer = false, optional = false) =>
  z.string().refine(
    (value) => {
      if (value.trim() === '') return optional
      const number = Number(value)
      return (
        Number.isFinite(number) &&
        number >= min &&
        number <= max &&
        (!integer || Number.isInteger(number))
      )
    },
    `Ingresa ${integer ? 'un entero' : 'un número'} entre ${min} y ${max}.`,
  )
export const eventFormSchema = z
  .object({
    proyectoId: numericText(1, Number.MAX_SAFE_INTEGER, true),
    nombre: z
      .string()
      .trim()
      .min(1, 'Ingresa el nombre del evento.')
      .max(160, 'Máximo 160 caracteres.'),
    descripcion: z.string().max(4000, 'Máximo 4000 caracteres.'),
    fecha: z.iso.date({ error: 'Selecciona una fecha válida.' }),
    hora: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d{1,9})?)?$/, 'Selecciona una hora válida.'),
    cupos: numericText(0, 2147483647, true),
    recinto: z.string().max(160, 'Máximo 160 caracteres.'),
    direccion: z.string().max(240, 'Máximo 240 caracteres.'),
    latitud: numericText(-90, 90, false, true),
    longitud: numericText(-180, 180, false, true),
    radioMetros: numericText(1, 50000, true),
    estado: z.enum(eventStates),
  })
  .refine((data) => Boolean(data.latitud.trim()) === Boolean(data.longitud.trim()), {
    path: ['longitud'],
    message: 'Completa latitud y longitud juntas.',
  })
export type EventoForm = z.infer<typeof eventFormSchema>
export function eventDefaults(event?: Evento): EventoForm {
  return {
    proyectoId: event ? String(event.proyectoId) : '',
    nombre: event?.nombre ?? '',
    descripcion: event?.descripcion ?? '',
    fecha: event?.fechaHora.split('T')[0] ?? '',
    hora: event?.fechaHora.split('T')[1] ?? '',
    cupos: String(event?.cupos ?? 0),
    recinto: event?.recinto ?? '',
    direccion: event?.direccion ?? '',
    latitud: event?.latitud == null ? '' : String(event.latitud),
    longitud: event?.longitud == null ? '' : String(event.longitud),
    radioMetros: String(event?.radioMetros ?? 200),
    estado: event?.estado ?? 'PROGRAMADO',
  }
}
export function eventPayload(form: EventoForm) {
  return {
    proyectoId: Number(form.proyectoId),
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    fechaHora: `${form.fecha}T${form.hora}`,
    cupos: Number(form.cupos),
    recinto: form.recinto.trim() || null,
    direccion: form.direccion.trim() || null,
    latitud: form.latitud.trim() ? Number(form.latitud) : null,
    longitud: form.longitud.trim() ? Number(form.longitud) : null,
    radioMetros: Number(form.radioMetros),
    estado: form.estado,
  }
}
export function canManageProject(project: Proyecto, roles: Role[], userId?: number) {
  return (
    roles.includes('ADMIN') ||
    (roles.includes('DOCENTE') && userId !== undefined && project.responsable?.id === userId)
  )
}
export function canDeleteEvent(event: Evento) {
  return event.inscritos === 0 && event.presentes === 0
}
