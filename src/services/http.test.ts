import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createHttpClient } from './http'

afterEach(() => vi.unstubAllGlobals())

describe('authenticated HTTP requests', () => {
  it('sends an access token and JSON without browser cookies', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 201 }))
    vi.stubGlobal('fetch', fetch)
    const http = createHttpClient('https://api.example/', 'synthetic-test-token')
    await http('/api/proyectos', { method: 'POST', body: { nombre: 'Comunidad' } })
    const options = fetch.mock.calls[0]?.[1]
    expect(options.headers.Authorization).toBe('Bearer synthetic-test-token')
    expect(options.credentials).toBe('omit')
    expect(options.body).toBe('{"nombre":"Comunidad"}')
  })
  it('handles an empty 204 delete response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    expect(
      await createHttpClient('https://api.example/', 'test')('/api/proyectos/1', {
        method: 'DELETE',
      }),
    ).toBeUndefined()
  })
  it('preserves the conflict message when a project has events', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ mensaje: 'El proyecto tiene eventos asociados' }), {
          status: 409,
        }),
      ),
    )
    await expect(
      createHttpClient('https://api.example/', 'test')('/api/proyectos/1', { method: 'DELETE' }),
    ).rejects.toMatchObject({ status: 409, message: 'El proyecto tiene eventos asociados' })
  })
  it('does not expose server internals on errors or automatically repeat writes', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response('{"mensaje":"private-db-error"}', { status: 500 }))
    vi.stubGlobal('fetch', fetch)
    await expect(
      createHttpClient('https://api.example/', 'test')('/api/proyectos', {
        method: 'POST',
        body: {},
      }),
    ).rejects.toMatchObject({
      status: 500,
      message: 'El servidor no está disponible. Inténtalo más tarde.',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
  it('rejects external paths and missing tokens before making a request', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await expect(
      createHttpClient('https://api.example/', 'test')('https://other.example/'),
    ).rejects.toBeInstanceOf(ApiError)
    await expect(
      createHttpClient('https://api.example/', '')('/api/proyectos'),
    ).rejects.toMatchObject({ status: 401 })
    expect(fetch).not.toHaveBeenCalled()
  })
  it('keeps field validation messages for forms', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ mensaje: 'Datos inválidos', detalles: { nombre: 'Es obligatorio' } }),
            { status: 400 },
          ),
        ),
    )
    await expect(
      createHttpClient('https://api.example/', 'test')('/api/proyectos', {
        method: 'POST',
        body: {},
      }),
    ).rejects.toMatchObject({ fields: { nombre: 'Es obligatorio' } })
  })
})
