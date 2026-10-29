import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  projectDefaults,
  projectFormSchema,
  projectStates,
  stateLabels,
} from '../../types/proyecto'
import type { Proyecto, ProyectoForm } from '../../types/proyecto'
import { ApiError, errorMessage } from '../../services/http'

type Props = {
  project?: Proyecto
  onSave: (form: ProyectoForm) => Promise<void>
  onClose: () => void
  busy: boolean
}
const inputClass =
  'min-h-11 w-full min-w-0 rounded-xl border border-outline bg-white px-3 py-2 text-base text-ink disabled:opacity-60'

export default function ProjectForm({ project, onSave, onClose, busy }: Props) {
  const submitting = useRef(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProyectoForm>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: projectDefaults(project),
  })
  async function submit(form: ProyectoForm) {
    if (submitting.current) return
    submitting.current = true
    try {
      await onSave(form)
    } catch (error) {
      if (error instanceof ApiError)
        for (const [field, message] of Object.entries(error.fields)) {
          if (field in projectFormSchema.shape) setError(field as keyof ProyectoForm, { message })
        }
      setError('root', { message: errorMessage(error) })
    } finally {
      submitting.current = false
    }
  }
  const fieldError = (field: keyof ProyectoForm) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-1 text-sm text-red-800">
        {errors[field]?.message}
      </p>
    ) : null
  const a11y = (field: keyof ProyectoForm) => ({
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  })
  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(submit)(event)
      }}
      noValidate
      aria-busy={busy}
    >
      <fieldset disabled={busy} className="space-y-5">
        <legend className="sr-only">Datos del proyecto</legend>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="nombre">
            Nombre del proyecto *
          </label>
          <input
            id="nombre"
            maxLength={160}
            className={inputClass}
            {...register('nombre')}
            {...a11y('nombre')}
          />
          {fieldError('nombre')}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="descripcion">
            Descripción
          </label>
          <textarea
            id="descripcion"
            maxLength={4000}
            rows={3}
            className={inputClass}
            {...register('descripcion')}
            {...a11y('descripcion')}
          />
          {fieldError('descripcion')}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="areaTematica">
              Área temática
            </label>
            <input
              id="areaTematica"
              maxLength={80}
              className={inputClass}
              {...register('areaTematica')}
              {...a11y('areaTematica')}
            />
            {fieldError('areaTematica')}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="unidadVecinal">
              Unidad vecinal
            </label>
            <input
              id="unidadVecinal"
              maxLength={160}
              className={inputClass}
              {...register('unidadVecinal')}
              {...a11y('unidadVecinal')}
            />
            {fieldError('unidadVecinal')}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="fechaInicio">
              Fecha de inicio
            </label>
            <input
              id="fechaInicio"
              type="date"
              className={inputClass}
              {...register('fechaInicio')}
              {...a11y('fechaInicio')}
            />
            {fieldError('fechaInicio')}
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="fechaFin">
              Fecha de fin
            </label>
            <input
              id="fechaFin"
              type="date"
              className={inputClass}
              {...register('fechaFin')}
              {...a11y('fechaFin')}
            />
            {fieldError('fechaFin')}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="estado">
            Estado
          </label>
          <select id="estado" className={inputClass} {...register('estado')}>
            {projectStates.map((state) => (
              <option key={state} value={state}>
                {stateLabels[state]}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
      {errors.root && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800">
          {errors.root.message}
        </p>
      )}
      <footer className="mt-7 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="min-h-11 rounded-full border border-outline px-5 py-2 text-sm text-primary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={busy}
          className="min-h-11 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          {busy ? 'Guardando…' : project ? 'Guardar cambios' : 'Crear proyecto'}
        </button>
      </footer>
    </form>
  )
}
