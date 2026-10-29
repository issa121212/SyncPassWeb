import { describe, expect, it } from 'vitest'
import { returnPath } from './session'

describe('authentication redirects', () => {
  it.each(['https://evil.example', '//evil.example', '/app\\evil', '/application', '/auth/callback'])('rejects unsafe return route %s', returnTo => {
    expect(returnPath({ returnTo })).toBe('/app')
  })
  it('preserves local protected routes', () => {
    expect(returnPath({ returnTo: '/app?tab=perfil' })).toBe('/app?tab=perfil')
  })
})
