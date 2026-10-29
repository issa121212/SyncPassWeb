export class ApiError extends Error {
  readonly status: number
  readonly fields: Record<string, string>
  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : 'No se pudo completar la operación. Inténtalo nuevamente.'
}

export function createHttpClient(baseUrl: string, accessToken: string) {
  return async function request(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: unknown
      signal?: AbortSignal
    } = {},
  ): Promise<unknown> {
    if (!path.startsWith('/api/')) throw new ApiError('Ruta de API inválida.', 0)
    if (!accessToken) throw new ApiError('Inicia sesión para continuar.', 401)
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    }
    if (options.body !== undefined) headers['Content-Type'] = 'application/json'
    let response: Response
    try {
      response = await fetch(new URL(path, baseUrl), {
        method: options.method ?? 'GET',
        headers,
        credentials: 'omit',
        redirect: 'error',
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: AbortSignal.any([
          AbortSignal.timeout(20_000),
          ...(options.signal ? [options.signal] : []),
        ]),
      })
    } catch (error) {
      if (options.signal?.aborted) throw error
      throw new ApiError(
        'No se pudo conectar con el servidor. Comprueba tu conexión y vuelve a intentar.',
        0,
      )
    }
    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null)
      const data =
        payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
      const fields: Record<string, string> = {}
      if (data.detalles && typeof data.detalles === 'object')
        for (const [key, value] of Object.entries(data.detalles)) {
          if (typeof value === 'string') fields[key] = value
        }
      const defaults: Record<number, string> = {
        401: 'Tu sesión no es válida para la API. Cierra sesión y vuelve a ingresar.',
        403: 'No tienes permiso para realizar esta acción.',
        404: 'El registro ya no está disponible. Actualiza la lista.',
        409: 'No se puede completar la acción porque el registro tiene información asociada.',
      }
      const message =
        response.status >= 500
          ? 'El servidor no está disponible. Inténtalo más tarde.'
          : response.status === 401
            ? defaults[401]!
            : typeof data.mensaje === 'string'
              ? data.mensaje
              : (defaults[response.status] ?? 'No se pudo completar la solicitud.')
      throw new ApiError(message, response.status, fields)
    }
    if (response.status === 204) return undefined
    return response.json()
  }
}

export type HttpClient = ReturnType<typeof createHttpClient>
