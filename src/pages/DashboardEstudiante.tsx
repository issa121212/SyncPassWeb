import { useIdentity } from '../auth/useIdentity'
import DashboardHeading from '../components/dashboard/DashboardHeading'
import WelcomePanel from '../components/dashboard/WelcomePanel'
import DashboardCards from '../components/dashboard/DashboardCards'
import PreparationNotice from '../components/dashboard/PreparationNotice'

export default function DashboardEstudiante() {
  const { name } = useIdentity()
  return (
    <>
      <DashboardHeading
        roleLabel="Estudiante / Recepción"
        name={name}
        description="Acompaña a los participantes y colabora en las actividades de tu comunidad."
      />
      <WelcomePanel
        title="Cada encuentro cuenta"
        icon="✓"
        description="Desde este espacio podrás consultar los eventos y apoyar el registro de asistencia de los participantes."
      />
      <DashboardCards title="Recepción y actividades" sections={['eventos', 'asistencias']} />
      <PreparationNotice />
    </>
  )
}
