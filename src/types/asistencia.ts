import { z } from 'zod'
const personSchema = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
  email: z.string().nullable(),
})
export const attendeeSchema = z.object({
  usuarioId: z.number().int().positive(),
  nombre: z.string(),
  email: z.string().nullable(),
  inscrito: z.boolean(),
  presente: z.boolean(),
  marcadoEn: z.iso.datetime({ offset: true }).nullable(),
})
export type Asistente = z.infer<typeof attendeeSchema>
export const attendanceSchema = z.object({
  id: z.number().int().positive(),
  eventoId: z.number().int().positive(),
  estudiante: personSchema,
  esPresente: z.boolean(),
  marcadoEn: z.iso.datetime({ offset: true }),
})
export const personalQrSchema = z.object({
  contenido: z
    .string()
    .max(256)
    .regex(/^ESTUDIANTE_[1-9]\d*$/),
})
export const scanSchema = z.object({
  codigoQr: z.string().min(1).max(256),
  clientUuid: z.uuid(),
  marcadoEn: z.iso.datetime(),
  esPresente: z.literal(true),
})
export type Escaneo = z.infer<typeof scanSchema>
export function qrError(content: string, eventId: number): string | null {
  if (content.length > 256) return 'El QR no es una credencial de participante válida.'
  if (/^ESTUDIANTE_[1-9]\d*$/.test(content)) return null
  const legacy = /^SYNC_PASS:ASISTENCIA:([1-9]\d*):[1-9]\d*$/.exec(content)
  if (legacy) return legacy[1] === String(eventId) ? null : 'El QR corresponde a otro evento.'
  return 'El QR no es una credencial de participante válida.'
}
