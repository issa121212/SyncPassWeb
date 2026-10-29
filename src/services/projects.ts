import { z } from 'zod'
import { ApiError } from './http'
import type { HttpClient } from './http'
import { projectPayload, projectSchema } from '../types/proyecto'
import type { ProyectoForm } from '../types/proyecto'

function decode<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload)
  if (!result.success)
    throw new ApiError('La respuesta del servidor no tiene el formato esperado.', 0)
  return result.data
}

export function projectService(http: HttpClient) {
  return {
    async list(signal?: AbortSignal) {
      return decode(z.array(projectSchema), await http('/api/proyectos', { signal }))
    },
    async create(form: ProyectoForm) {
      return decode(
        projectSchema,
        await http('/api/proyectos', { method: 'POST', body: projectPayload(form) }),
      )
    },
    async update(id: number, form: ProyectoForm) {
      return decode(
        projectSchema,
        await http(`/api/proyectos/${id}`, { method: 'PUT', body: projectPayload(form) }),
      )
    },
    async remove(id: number) {
      await http(`/api/proyectos/${id}`, { method: 'DELETE' })
    },
    async me(signal?: AbortSignal) {
      return decode(
        z.object({ id: z.number().int().positive(), nombre: z.string() }),
        await http('/api/usuarios/me', { signal }),
      )
    },
  }
}
