import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import DashboardEntry from '../auth/DashboardEntry'
import { useIdentity } from '../auth/useIdentity'
import { roleLabels } from '../auth/identity'
import type { Role } from '../auth/identity'

vi.mock('../auth/useIdentity', () => ({ useIdentity: vi.fn() }))

function renderDashboard(role: Role, roles: Role[] = [role]) {
  vi.mocked(useIdentity).mockReturnValue({ name: 'Ana', roles, role, roleLabel: roleLabels[role] })
  return renderToStaticMarkup(
    <MemoryRouter>
      <DashboardEntry />
    </MemoryRouter>,
  )
}

describe('separate role dashboards', () => {
  it('renders teacher coordination and its three sections', () => {
    const html = renderDashboard('DOCENTE')
    expect(html).toContain('Herramientas de coordinación')
    expect(html).toContain('href="/app/proyectos"')
    expect(html).toContain('href="/app/asistencias"')
    expect(html).not.toContain('href="/app/inscripciones"')
  })
  it('renders the student reception page without project management', () => {
    const html = renderDashboard('VOLUNTARIO')
    expect(html).toContain('Recepción y actividades')
    expect(html).toContain('href="/app/asistencias"')
    expect(html).not.toContain('href="/app/proyectos"')
  })
  it('renders participant activities and registrations without attendance management', () => {
    const html = renderDashboard('PARTICIPANTE')
    expect(html).toContain('Tu participación')
    expect(html).toContain('href="/app/inscripciones"')
    expect(html).not.toContain('href="/app/asistencias"')
    expect(html).not.toContain('href="/app/proyectos"')
  })
  it('uses the teacher page for administrators', () => {
    expect(renderDashboard('ADMIN', ['ADMIN', 'DOCENTE'])).toContain('Herramientas de coordinación')
  })
})
