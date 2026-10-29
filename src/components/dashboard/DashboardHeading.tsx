type Props = { roleLabel: string; name: string; description: string }

export default function DashboardHeading({ roleLabel, name, description }: Props) {
  return (
    <header className="mb-7 sm:mb-8">
      <p className="mb-4 text-[10px] font-semibold tracking-[.18em] text-muted uppercase">
        {roleLabel}
      </p>
      <h1 className="mb-3 text-3xl font-bold tracking-tight wrap-anywhere sm:text-4xl">
        Hola, {name}
        <span className="text-primary">.</span>
      </h1>
      <p className="max-w-2xl text-sm leading-7 text-muted">{description}</p>
    </header>
  )
}
