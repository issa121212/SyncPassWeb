import { describe, expect, it } from 'vitest'
import { projectDefaults, projectFormSchema, projectPayload, projectSchema } from './proyecto'

describe('project input and API contract', () => {
  it('rejects blank names, excessive lengths and invalid calendar dates', () => {
    expect(projectFormSchema.safeParse({ ...projectDefaults(), nombre: '   ' }).success).toBe(false)
    expect(
      projectFormSchema.safeParse({ ...projectDefaults(), nombre: 'a'.repeat(161) }).success,
    ).toBe(false)
    expect(
      projectFormSchema.safeParse({
        ...projectDefaults(),
        nombre: 'Huerto',
        fechaInicio: '2026-02-30',
      }).success,
    ).toBe(false)
  })
  it('does not allow an end date before the start date', () => {
    const result = projectFormSchema.safeParse({
      ...projectDefaults(),
      nombre: 'Huerto',
      fechaInicio: '2026-12-04',
      fechaFin: '2026-12-03',
    })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(['fechaFin'])
  })
  it('normalizes empty optional fields to null for the backend', () => {
    expect(projectPayload({ ...projectDefaults(), nombre: ' Huerto ' })).toMatchObject({
      nombre: 'Huerto',
      fechaInicio: null,
      fechaFin: null,
      areaTematica: null,
    })
  })
  it('accepts the real API field structure and refuses demo identifiers', () => {
    const project = {
      id: 1,
      nombre: 'Huerto',
      descripcion: null,
      areaTematica: null,
      unidadVecinal: null,
      fechaInicio: null,
      fechaFin: null,
      estado: 'PLANIFICADO',
      responsable: { id: 2, nombre: 'Ana', email: null },
    }
    expect(projectSchema.safeParse(project).success).toBe(true)
    expect(projectSchema.safeParse({ ...project, id: 'DEMO-001' }).success).toBe(false)
    expect(projectSchema.safeParse({ ...project, estado: 'INVENTADO' }).success).toBe(false)
  })
})
