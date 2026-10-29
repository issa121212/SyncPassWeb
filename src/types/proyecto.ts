import { z } from 'zod'

export const projectStates = ['PLANIFICADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'] as const
export const stateLabels: Record<(typeof projectStates)[number], string> = {
  PLANIFICADO: 'Planificado',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
}
export const projectSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
  descripcion: z.string().nullable(),
  areaTematica: z.string().nullable(),
  unidadVecinal: z.string().nullable(),
  fechaInicio: z.iso.date().nullable(),
  fechaFin: z.iso.date().nullable(),
  estado: z.enum(projectStates),
  responsable: z
    .object({ id: z.number().int().positive(), nombre: z.string(), email: z.string().nullable() })
    .nullable(),
})
export type Proyecto = z.infer<typeof projectSchema>

const optionalDate = z.union([z.literal(''), z.iso.date({ error: 'Ingresa una fecha válida.' })])
export const projectFormSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, 'Ingresa el nombre del proyecto.')
      .max(160, 'Máximo 160 caracteres.'),
    descripcion: z.string().max(4000, 'Máximo 4000 caracteres.'),
    areaTematica: z.string().max(80, 'Máximo 80 caracteres.'),
    unidadVecinal: z.string().max(160, 'Máximo 160 caracteres.'),
    fechaInicio: optionalDate,
    fechaFin: optionalDate,
    estado: z.enum(projectStates),
  })
  .refine((data) => !data.fechaInicio || !data.fechaFin || data.fechaFin >= data.fechaInicio, {
    path: ['fechaFin'],
    message: 'La fecha de fin no puede ser anterior a la fecha de inicio.',
  })
export type ProyectoForm = z.infer<typeof projectFormSchema>
export function projectPayload(form: ProyectoForm) {
  return {
    ...form,
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    areaTematica: form.areaTematica.trim() || null,
    unidadVecinal: form.unidadVecinal.trim() || null,
    fechaInicio: form.fechaInicio || null,
    fechaFin: form.fechaFin || null,
  }
}
export function projectDefaults(project?: Proyecto): ProyectoForm {
  return {
    nombre: project?.nombre ?? '',
    descripcion: project?.descripcion ?? '',
    areaTematica: project?.areaTematica ?? '',
    unidadVecinal: project?.unidadVecinal ?? '',
    fechaInicio: project?.fechaInicio ?? '',
    fechaFin: project?.fechaFin ?? '',
    estado: project?.estado ?? 'PLANIFICADO',
  }
}
