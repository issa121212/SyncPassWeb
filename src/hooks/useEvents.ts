import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from './useHttpClient'
import { eventService } from '../services/events'
import { projectService } from '../services/projects'
import type { Evento, EventoForm } from '../types/evento'
export function useEvents(manager: boolean) {
  const http = useHttpClient()
  const service = eventService(http)
  const projectsService = projectService(http)
  const client = useQueryClient()
  const events = useQuery({ queryKey: ['events'], queryFn: ({ signal }) => service.list(signal) })
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: ({ signal }) => projectsService.list(signal),
    enabled: manager,
  })
  const me = useQuery({
    queryKey: ['me'],
    queryFn: ({ signal }) => projectsService.me(signal),
    enabled: manager,
  })
  const save = useMutation({
    mutationFn: ({ id, form }: { id?: number; form: EventoForm }) =>
      id === undefined ? service.create(form) : service.update(id, form),
    onSuccess: (event) => {
      client.setQueryData<Evento[]>(['events'], (previous) =>
        previous
          ? [...previous.filter((item) => item.id !== event.id), event].sort((a, b) =>
              a.fechaHora.localeCompare(b.fechaHora),
            )
          : undefined,
      )
      return client.invalidateQueries({ queryKey: ['events'] })
    },
  })
  const remove = useMutation({
    mutationFn: (id: number) => service.remove(id),
    onSuccess: (_, id) => {
      client.setQueryData<Evento[]>(['events'], (previous) =>
        previous?.filter((item) => item.id !== id),
      )
      return client.invalidateQueries({ queryKey: ['events'] })
    },
  })
  return { events, projects, me, save, remove }
}
