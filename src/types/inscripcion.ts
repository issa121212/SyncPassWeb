import type { Evento } from './evento'

export function registrationBlockedReason(event: Evento): string | null {
  if (event.inscrito) return 'Ya estás inscrito en este evento.'
  if (event.estado === 'CANCELADO') return 'Este evento está cancelado.'
  if (event.estado === 'FINALIZADO') return 'Este evento ya finalizó.'
  if (event.cupos > 0 && event.inscritos >= event.cupos) return 'No quedan cupos disponibles.'
  if (!event.qrContenido?.trim()) return 'La inscripción no está disponible para este evento.'
  return null
}
