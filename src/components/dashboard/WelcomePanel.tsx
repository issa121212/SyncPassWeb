import { useId } from 'react'

type Props = { title: string; description: string; icon?: string }

export default function WelcomePanel({ title, description, icon = '✦' }: Props) {
  const titleId = useId()
  return (
    <section
      className="mb-9 flex items-center gap-4 rounded-2xl border border-primary/15 bg-primary-container p-5 sm:gap-5 sm:p-7"
      aria-labelledby={titleId}
    >
      <span className="shrink-0 text-3xl text-primary" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 id={titleId} className="mb-2 text-base font-semibold text-on-container">
          {title}
        </h2>
        <p className="max-w-xl text-sm leading-6 text-on-container/80">{description}</p>
      </div>
      <span className="ml-auto hidden shrink-0 rounded-full border border-primary/20 bg-white/60 px-3 py-2 text-[10px] text-primary xl:block">
        ● Sesión iniciada
      </span>
    </section>
  )
}
