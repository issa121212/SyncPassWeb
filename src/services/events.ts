import { z } from 'zod'
import { ApiError } from './http'
import type { HttpClient } from './http'
import { eventSchema, eventPayload } from '../types/evento'
import type { EventoForm } from '../types/evento'
function decode<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload)
  if (!result.success)
    throw new ApiError('La respuesta del servidor no tiene el formato esperado.', 0)
  return result.data
}
export function eventService(http: HttpClient) {
  return {
    async list(signal?: AbortSignal) {
      return decode(z.array(eventSchema), await http('/api/eventos', { signal }))
    },
    async create(form: EventoForm) {
      return decode(
        eventSchema,
        await http('/api/eventos', { method: 'POST', body: eventPayload(form) }),
      )
    },
    async update(id: number, form: EventoForm) {
      return decode(
        eventSchema,
        await http(`/api/eventos/${id}`, { method: 'PUT', body: eventPayload(form) }),
      )
    },
    async remove(id: number) {
      await http(`/api/eventos/${id}`, { method: 'DELETE' })
    },
  }
}
