import type { Role } from '../../auth/identity'

export const modules = [
  { slug: 'proyectos', title: 'Proyectos comunitarios', shortTitle: 'Proyectos', icon: '▦', description: 'Organiza los proyectos y coordina las iniciativas de tu comunidad.', roles: ['DOCENTE'] },
  { slug: 'eventos', title: 'Eventos y talleres', shortTitle: 'Eventos', icon: '◷', description: 'Encuentra las actividades de tu comunidad y consulta sus detalles.', roles: ['DOCENTE', 'VOLUNTARIO', 'PARTICIPANTE'] },
  { slug: 'asistencias', title: 'Control de asistencia', shortTitle: 'Asistencias', icon: '✓', description: 'Acompaña la recepción y revisa la asistencia de los participantes.', roles: ['DOCENTE', 'VOLUNTARIO'] },
  { slug: 'inscripciones', title: 'Mis inscripciones', shortTitle: 'Inscripciones', icon: '≡', description: 'Consulta las actividades en las que participas y su estado.', roles: ['PARTICIPANTE'] },
] as const

export type DashboardModule = typeof modules[number]
export function canAccess(module: DashboardModule, roles: Role[]): boolean {
  return module.roles.some(role => roles.includes(role))
}
export function availableModules(roles: Role[]) {
  return modules.filter(module => canAccess(module, roles))
}
