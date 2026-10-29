export type Role = 'DOCENTE' | 'VOLUNTARIO' | 'PARTICIPANTE' | 'ADMIN'

const aliases: Record<string, Role> = {
  profesor: 'DOCENTE', docente: 'DOCENTE', teacher: 'DOCENTE', coordinador: 'DOCENTE', jefe: 'DOCENTE', responsable: 'DOCENTE',
  voluntario: 'VOLUNTARIO', voluntarios: 'VOLUNTARIO', recepcion: 'VOLUNTARIO', recepcionista: 'VOLUNTARIO', recepcionistas: 'VOLUNTARIO', ayudante: 'VOLUNTARIO', ayudantes: 'VOLUNTARIO',
  estudiante: 'VOLUNTARIO', alumno: 'VOLUNTARIO', alumnos: 'VOLUNTARIO', student: 'VOLUNTARIO', monitor: 'VOLUNTARIO', monitores: 'VOLUNTARIO',
  participante: 'PARTICIPANTE', participantes: 'PARTICIPANTE', asistente: 'PARTICIPANTE', asistentes: 'PARTICIPANTE', beneficiario: 'PARTICIPANTE', beneficiarios: 'PARTICIPANTE',
  admin: 'ADMIN', administrador: 'ADMIN', superadmin: 'ADMIN',
}

// Same group aliases and default as the backend CognitoRoles class.
// This determines navigation only; the API must independently enforce permissions.
export function rolesFromProfile(profile: Record<string, unknown>): Role[] {
  const groups = profile['cognito:groups']
  const roles = new Set<Role>()
  if (Array.isArray(groups)) for (const group of groups) {
    if (typeof group !== 'string') continue
    const role = aliases[group.trim().toLowerCase()]
    if (role) roles.add(role)
    if (role === 'ADMIN') roles.add('DOCENTE')
  }
  return roles.size ? [...roles] : ['PARTICIPANTE']
}

export function displayName(profile: Record<string, unknown>): string {
  for (const key of ['name', 'given_name', 'email']) {
    const value = profile[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return 'Usuario'
}

export const roleLabels: Record<Role, string> = {
  ADMIN: 'Administración', DOCENTE: 'Docente / Coordinación', VOLUNTARIO: 'Estudiante / Recepción', PARTICIPANTE: 'Participante',
}

export function primaryRole(roles: Role[]): Role {
  return (['ADMIN', 'DOCENTE', 'VOLUNTARIO', 'PARTICIPANTE'] as const).find(role => roles.includes(role)) ?? 'PARTICIPANTE'
}
