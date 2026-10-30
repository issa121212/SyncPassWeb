import { Component } from 'react'
import type { ReactNode } from 'react'

export default class AppErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed)
      return (
        <main className="grid min-h-dvh place-items-center p-6">
          <section
            className="max-w-md rounded-2xl border border-outline bg-white p-8 text-center"
            aria-labelledby="app-error-title"
          >
            <h1 className="mb-4 text-2xl font-semibold" id="app-error-title">
              No pudimos cargar la página
            </h1>
            <p className="mb-6 text-sm leading-7 text-muted">
              Comprueba tu conexión y vuelve a cargar la aplicación.
            </p>
            <button
              type="button"
              className="min-h-12 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
              onClick={() => window.location.reload()}
            >
              Volver a cargar
            </button>
          </section>
        </main>
      )
    return this.props.children
  }
}
