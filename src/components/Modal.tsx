import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

export default function Modal({
  title,
  children,
  onClose,
  busy = false,
}: {
  title: string
  children: ReactNode
  onClose: () => void
  busy?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    dialog?.showModal()
    return () => {
      dialog?.close()
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus()
      else document.getElementById('dashboard-content')?.focus()
    }
  }, [])
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-2xl border border-outline bg-surface p-5 text-ink shadow-xl backdrop:bg-black/40 sm:p-7"
    >
      <header className="mb-6 flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-xl font-semibold">
          {title}
        </h2>
        <button
          type="button"
          aria-label="Cerrar ventana"
          disabled={busy}
          onClick={onClose}
          className="grid size-11 shrink-0 place-items-center rounded-full text-xl hover:bg-primary/10"
        >
          ×
        </button>
      </header>
      {children}
    </dialog>
  )
}
