import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useHttpClient } from './useHttpClient'
import { projectService } from '../services/projects'
import type { ProyectoForm } from '../types/proyecto'

export function useProjects() {
  const service = projectService(useHttpClient())
  const client = useQueryClient()
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: ({ signal }) => service.list(signal),
  })
  const me = useQuery({ queryKey: ['me'], queryFn: ({ signal }) => service.me(signal) })
  const save = useMutation({
    mutationFn: ({ id, form }: { id?: number; form: ProyectoForm }) =>
      id === undefined ? service.create(form) : service.update(id, form),
    onSuccess: (project) => {
      client.setQueryData(
        ['projects'],
        (previous: Awaited<ReturnType<typeof service.list>> | undefined) =>
          previous ? [project, ...previous.filter((item) => item.id !== project.id)] : undefined,
      )
      void client.invalidateQueries({ queryKey: ['projects'] })
    },
  })
  const remove = useMutation({
    mutationFn: (id: number) => service.remove(id),
    onSuccess: (_, id) => {
      client.setQueryData(
        ['projects'],
        (previous: Awaited<ReturnType<typeof service.list>> | undefined) =>
          previous?.filter((item) => item.id !== id),
      )
      void client.invalidateQueries({ queryKey: ['projects'] })
    },
  })
  return { projects, me, save, remove }
}
