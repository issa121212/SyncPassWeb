export default function PageLoading({ fullScreen = false }: { fullScreen?: boolean }) {
  const status = (
    <div className="p-8 text-center">
      <output className="block">
        <span
          className="mb-4 inline-block size-8 animate-spin rounded-full border-3 border-primary/20 border-t-primary"
          aria-hidden="true"
        />
        <span className="block text-sm text-muted">Cargando…</span>
      </output>
    </div>
  )
  return fullScreen ? (
    <main className="grid min-h-dvh place-items-center p-6">{status}</main>
  ) : (
    status
  )
}
