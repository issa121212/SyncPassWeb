import { useIdentity } from './useIdentity'
import DashboardDocente from '../pages/DashboardDocente'
import DashboardEstudiante from '../pages/DashboardEstudiante'
import DashboardParticipante from '../pages/DashboardParticipante'

export default function DashboardEntry() {
  const { role } = useIdentity()
  if (role === 'ADMIN' || role === 'DOCENTE') return <DashboardDocente />
  if (role === 'VOLUNTARIO') return <DashboardEstudiante />
  return <DashboardParticipante />
}
