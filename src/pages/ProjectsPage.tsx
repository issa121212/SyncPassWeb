import { useState } from 'react'
import { useIdentity } from '../auth/useIdentity'
import { useProjects } from '../hooks/useProjects'
import { errorMessage } from '../services/http'
import type { Proyecto } from '../types/proyecto'
import Modal from '../components/Modal'
import ProjectForm from '../components/projects/ProjectForm'
import ProjectCard from '../components/projects/ProjectCard'
import PageLoading from '../components/PageLoading'

export default function ProjectsPage() {
  const { roles } = useIdentity()
  if (!roles.includes('DOCENTE'))
    return (
      <section>
        <h1 className="mb-4 text-2xl font-semibold">Sección no disponible</h1>
        <p>No tienes acceso a la gestión de proyectos.</p>
      </section>
    )
  return <ProjectManager />
}

function ProjectManager() {
  const { roles } = useIdentity()
  const { projects, me, save, remove } = useProjects()
  const [editor, setEditor] = useState<{ project?: Proyecto } | null>(null)
  const [deleting, setDeleting] = useState<Proyecto | null>(null)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const filtered =
    projects.data?.filter((project) =>
      `${project.nombre} ${project.areaTematica ?? ''} ${project.unidadVecinal ?? ''}`
        .toLocaleLowerCase('es')
        .includes(search.trim().toLocaleLowerCase('es')),
    ) ?? []
  async function confirmDelete() {
    if (!deleting || remove.isPending) return
    try {
      await remove.mutateAsync(deleting.id)
      setDeleting(null)
      setNotice('Proyecto eliminado correctamente.')
    } catch {
      /* Mutation error remains visible inside the dialog. */
    }
  }
  return (
    <>
      <header className="mb-7 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="mb-3 text-xs tracking-widest text-muted">MI COMUNIDAD</p>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Proyectos comunitarios
          </h1>
          <p className="text-sm leading-7 text-muted">
            Organiza las iniciativas y gestiona los proyectos de tu comunidad.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNotice('')
            setEditor({})
            save.reset()
          }}
          className="min-h-12 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Nuevo proyecto
        </button>
      </header>
      {notice && (
        <output className="mb-5 block rounded-xl bg-primary-container p-4 text-sm text-on-container">
          {notice}
        </output>
      )}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="project-search" className="mb-2 block text-sm font-medium">
            Buscar proyectos
          </label>
          <input
            id="project-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre, área o unidad vecinal"
            className="min-h-11 w-full rounded-xl border border-outline bg-white px-4 py-2 text-base"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            void projects.refetch()
            void me.refetch()
          }}
          disabled={projects.isFetching}
          className="min-h-11 rounded-full border border-primary/40 px-5 py-2 text-sm text-primary"
        >
          {projects.isFetching ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>
      {projects.isPending && <PageLoading />}
      {projects.isError && (
        <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm leading-7 text-red-800">
          {errorMessage(projects.error)}
          {projects.data && ' Se muestran los últimos datos recibidos.'}
        </p>
      )}
      {me.isError && (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900"
        >
          No se pudo comprobar tu perfil. Actualiza para habilitar la edición de tus proyectos.
        </p>
      )}
      {projects.data && (
        <>
          <p className="mb-4 text-sm text-muted">
            {filtered.length} {filtered.length === 1 ? 'proyecto' : 'proyectos'}
          </p>
          {filtered.length ? (
            <ul className="grid list-none grid-cols-1 gap-5 p-0 xl:grid-cols-2">
              {filtered.map((project) => (
                <li key={project.id} className="min-w-0">
                  <ProjectCard
                    project={project}
                    editable={
                      roles.includes('ADMIN') ||
                      (me.data !== undefined && project.responsable?.id === me.data.id)
                    }
                    onEdit={() => {
                      setNotice('')
                      setEditor({ project })
                      save.reset()
                    }}
                    onDelete={() => {
                      setNotice('')
                      setDeleting(project)
                      remove.reset()
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <section className="rounded-2xl border border-outline bg-white p-8 text-center">
              <h2 className="mb-3 text-xl font-semibold">
                {search ? 'No encontramos coincidencias' : 'Todavía no hay proyectos'}
              </h2>
              <p className="text-sm leading-7 text-muted">
                {search ? 'Prueba con otra búsqueda.' : 'Crea el primer proyecto para comenzar.'}
              </p>
            </section>
          )}
        </>
      )}
      {editor && (
        <Modal
          title={editor.project ? 'Editar proyecto' : 'Nuevo proyecto'}
          onClose={() => setEditor(null)}
          busy={save.isPending}
        >
          <ProjectForm
            project={editor.project}
            busy={save.isPending}
            onClose={() => setEditor(null)}
            onSave={async (form) => {
              await save.mutateAsync({ id: editor.project?.id, form })
              setEditor(null)
              setNotice(
                editor.project
                  ? 'Proyecto actualizado correctamente.'
                  : 'Proyecto creado correctamente.',
              )
            }}
          />
        </Modal>
      )}
      {deleting && (
        <Modal title="Eliminar proyecto" onClose={() => setDeleting(null)} busy={remove.isPending}>
          <p className="text-sm leading-7">
            ¿Quieres eliminar <strong className="wrap-anywhere">{deleting.nombre}</strong>? Esta
            acción no se puede deshacer.
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Si tiene eventos asociados, el servidor impedirá eliminarlo.
          </p>
          {remove.isError && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800"
            >
              {errorMessage(remove.error)}
            </p>
          )}
          <footer className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => setDeleting(null)}
              className="min-h-11 rounded-full border border-outline px-5 py-2 text-sm text-primary"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => void confirmDelete()}
              className="min-h-11 rounded-full bg-red-800 px-5 py-2 text-sm font-semibold text-white"
            >
              {remove.isPending ? 'Eliminando…' : 'Eliminar proyecto'}
            </button>
          </footer>
        </Modal>
      )}
    </>
  )
}
