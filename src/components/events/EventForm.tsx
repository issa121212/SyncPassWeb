import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventDefaults, eventFormSchema, eventStates, eventStateLabels } from '../../types/evento'
import type { Evento, EventoForm } from '../../types/evento'
import type { Proyecto } from '../../types/proyecto'
import { ApiError, errorMessage } from '../../services/http'
const inputClass =
  'min-h-11 w-full min-w-0 rounded-xl border border-outline bg-white px-3 py-2 text-base text-ink disabled:opacity-60'
export default function EventForm({
  event,
  projects,
  busy,
  onSave,
  onClose,
}: {
  event?: Evento
  projects: Proyecto[]
  busy: boolean
  onSave: (form: EventoForm) => Promise<void>
  onClose: () => void
}) {
  const submitting = useRef(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EventoForm>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: eventDefaults(event),
  })
  async function submit(form: EventoForm) {
    if (submitting.current) return
    if (!projects.some((project) => project.id === Number(form.proyectoId))) {
      setError('proyectoId', { message: 'Selecciona un proyecto que puedas gestionar.' })
      return
    }
    if (event && Number(form.cupos) > 0 && Number(form.cupos) < event.inscritos) {
      setError('cupos', { message: 'El cupo no puede ser menor que las inscripciones existentes.' })
      return
    }
    submitting.current = true
    try {
      await onSave(form)
    } catch (error) {
      if (error instanceof ApiError)
        for (const [field, message] of Object.entries(error.fields)) {
          if (field === 'fechaHora') {
            setError('fecha', { message })
            setError('hora', { message })
          } else if (field in eventFormSchema.shape)
            setError(field as keyof EventoForm, { message })
        }
      setError('root', { message: errorMessage(error) })
    } finally {
      submitting.current = false
    }
  }
  const a11y = (field: keyof EventoForm) => ({
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? `evento-${field}-error` : undefined,
  })
  const fieldError = (field: keyof EventoForm) =>
    errors[field] ? (
      <p id={`evento-${field}-error`} className="mt-1 text-sm text-red-800">
        {errors[field]?.message}
      </p>
    ) : null
  const fields = [
    { name: 'nombre', label: 'Nombre del evento *', type: 'text', maxLength: 160 },
    { name: 'fecha', label: 'Fecha *', type: 'date' },
    { name: 'hora', label: 'Hora *', type: 'time', step: 'any' },
    {
      name: 'cupos',
      label: 'Cupos (0 = sin límite) *',
      type: 'number',
      min: 0,
      max: 2147483647,
      step: '1',
    },
    { name: 'recinto', label: 'Recinto', type: 'text', maxLength: 160 },
    { name: 'direccion', label: 'Dirección', type: 'text', maxLength: 240 },
    { name: 'latitud', label: 'Latitud', type: 'number', min: -90, max: 90, step: 'any' },
    { name: 'longitud', label: 'Longitud', type: 'number', min: -180, max: 180, step: 'any' },
    {
      name: 'radioMetros',
      label: 'Radio en metros *',
      type: 'number',
      min: 1,
      max: 50000,
      step: '1',
    },
  ] as const
  return (
    <form
      noValidate
      aria-busy={busy}
      onSubmit={(e) => {
        void handleSubmit(submit)(e)
      }}
    >
      <fieldset disabled={busy} className="space-y-5">
        <legend className="sr-only">Datos del evento</legend>
        <div>
          <label htmlFor="evento-proyectoId" className="mb-2 block text-sm font-medium">
            Proyecto *
          </label>
          <select
            id="evento-proyectoId"
            className={inputClass}
            {...register('proyectoId')}
            {...a11y('proyectoId')}
          >
            <option value="">Selecciona un proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.nombre}
              </option>
            ))}
          </select>
          {fieldError('proyectoId')}
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {fields.map(({ name, label, ...attributes }) => (
            <div key={name}>
              <label htmlFor={`evento-${name}`} className="mb-2 block text-sm font-medium">
                {label}
              </label>
              <input
                id={`evento-${name}`}
                className={inputClass}
                {...attributes}
                {...register(name)}
                {...a11y(name)}
              />
              {fieldError(name)}
            </div>
          ))}
        </div>
        <p className="text-sm leading-6 text-muted">
          Fecha y hora local de la actividad. Las coordenadas son opcionales y deben completarse
          juntas.
        </p>
        <div>
          <label htmlFor="evento-descripcion" className="mb-2 block text-sm font-medium">
            Descripción
          </label>
          <textarea
            id="evento-descripcion"
            rows={3}
            maxLength={4000}
            className={inputClass}
            {...register('descripcion')}
            {...a11y('descripcion')}
          />
          {fieldError('descripcion')}
        </div>
        <div>
          <label htmlFor="evento-estado" className="mb-2 block text-sm font-medium">
            Estado
          </label>
          <select
            id="evento-estado"
            className={inputClass}
            {...register('estado')}
            {...a11y('estado')}
          >
            {eventStates.map((state) => (
              <option key={state} value={state}>
                {eventStateLabels[state]}
              </option>
            ))}
          </select>
          {fieldError('estado')}
        </div>
      </fieldset>
      {errors.root && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">
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
          disabled={busy || !projects.length}
          className="min-h-11 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? 'Guardando…' : event ? 'Guardar cambios' : 'Crear evento'}
        </button>
      </footer>
    </form>
  )
}
