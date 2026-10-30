import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from './useHttpClient'
import { attendanceService } from '../services/attendance'
import type { Asistente, Escaneo } from '../types/asistencia'
export function usePersonalQr() {
  const service = attendanceService(useHttpClient())
  return useQuery({
    queryKey: ['personal-qr'],
    queryFn: ({ signal }) => service.personalQr(signal),
  })
}
export function useAttendance(eventId: number) {
  const service = attendanceService(useHttpClient())
  const client = useQueryClient()
  const attendees = useQuery({
    queryKey: ['attendance', eventId],
    queryFn: ({ signal }) => service.attendees(eventId, signal),
  })
  const scan = useMutation({
    mutationFn: (request: Escaneo) => service.scan(eventId, request),
    retry: false,
    onSuccess: (result) => {
      client.setQueryData<Asistente[]>(['attendance', eventId], (previous) => {
        if (!previous) return previous
        const attendee = {
          usuarioId: result.estudiante.id,
          nombre: result.estudiante.nombre,
          email: result.estudiante.email,
          inscrito: true,
          presente: true,
          marcadoEn: result.marcadoEn,
        }
        return previous.some((item) => item.usuarioId === attendee.usuarioId)
          ? previous.map((item) => (item.usuarioId === attendee.usuarioId ? attendee : item))
          : [...previous, attendee]
      })
    },
    onSettled: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ['attendance', eventId] }),
        client.invalidateQueries({ queryKey: ['events'] }),
      ]),
  })
  return { attendees, scan }
}
