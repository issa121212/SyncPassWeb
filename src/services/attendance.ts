import { z } from 'zod'
import { ApiError } from './http'
import type { HttpClient } from './http'
import { attendeeSchema, attendanceSchema, personalQrSchema, scanSchema } from '../types/asistencia'
import type { Escaneo } from '../types/asistencia'
function decode<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload)
  if (!result.success)
    throw new ApiError('La respuesta del servidor no tiene el formato esperado.', 0)
  return result.data
}
export function attendanceService(http: HttpClient) {
  return {
    async personalQr(signal?: AbortSignal) {
      return decode(personalQrSchema, await http('/api/usuarios/me/qr', { signal }))
    },
    async attendees(eventId: number, signal?: AbortSignal) {
      return decode(
        z.array(attendeeSchema),
        await http(`/api/eventos/${eventId}/asistentes`, { signal }),
      )
    },
    async scan(eventId: number, request: Escaneo) {
      const result = decode(
        attendanceSchema,
        await http(`/api/eventos/${eventId}/asistencias/escanear`, {
          method: 'POST',
          body: scanSchema.parse(request),
        }),
      )
      if (result.eventoId !== eventId || !result.esPresente)
        throw new ApiError(
          'El servidor no confirmó la asistencia para este evento. Actualiza la lista antes de reintentar.',
          0,
        )
      return result
    },
  }
}
