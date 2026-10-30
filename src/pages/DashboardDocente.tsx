import { useIdentity } from '../auth/useIdentity'
import DashboardHeading from '../components/dashboard/DashboardHeading'
import WelcomePanel from '../components/dashboard/WelcomePanel'
import DashboardCards from '../components/dashboard/DashboardCards'

export default function DashboardDocente() {
  const { name, roleLabel } = useIdentity()
  return (
    <>
      <DashboardHeading
        roleLabel={roleLabel}
        name={name}
        description="Organiza tus proyectos y talleres, y acompaña la participación de tu comunidad."
      />
      <WelcomePanel
        title="Coordina tu comunidad"
        description="Tu espacio para planificar iniciativas, organizar actividades y hacer seguimiento a la asistencia."
      />
      <DashboardCards
        title="Herramientas de coordinación"
        sections={['proyectos', 'eventos', 'asistencias']}
      />
    </>
  )
}
