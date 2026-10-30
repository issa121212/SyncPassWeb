import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from './useHttpClient'
import { eventService } from '../services/events'
import type { Evento } from '../types/evento'

export function useEventRegistration() {
  const service = eventService(useHttpClient())
  const client = useQueryClient()
  return useMutation({
    mutationFn: (codigoQr: string) => service.register(codigoQr),
    retry: false,
    onSuccess: (event) => {
      client.setQueryData<Evento[]>(['events'], (previous) =>
        previous?.map((item) => (item.id === event.id ? event : item)),
      )
    },
    // Recheck capacity and event state after both success and a concurrent rejection.
    onSettled: () => client.invalidateQueries({ queryKey: ['events'] }),
  })
}
