import { useIdentity } from '../auth/useIdentity'
import DashboardHeading from '../components/dashboard/DashboardHeading'
import WelcomePanel from '../components/dashboard/WelcomePanel'
import DashboardCards from '../components/dashboard/DashboardCards'

export default function DashboardParticipante() {
  const { name } = useIdentity()
  return (
    <>
      <DashboardHeading
        roleLabel="Participante"
        name={name}
        description="Descubre los encuentros de tu comunidad y acompaña tus actividades."
      />
      <WelcomePanel
        title="Encuentra tu próximo encuentro"
        icon="◷"
        description="Explora los eventos y talleres, y consulta las actividades en las que participas."
      />
      <DashboardCards title="Tu participación" sections={['eventos', 'inscripciones']} />
    </>
  )
}
