import { describe, expect, it } from 'vitest'
import { displayName, primaryRole, rolesFromProfile } from './identity'
import { availableModules, canAccess, modules } from '../features/dashboard/modules'
import { logoutUrl } from './logout'

describe('Cognito groups and navigation', () => {
  it.each(['ESTUDIANTE', 'alumno', ' monitor ', 'voluntario'])('maps reception group %s to volunteer', group => {
    expect(rolesFromProfile({ 'cognito:groups': [group] })).toEqual(['VOLUNTARIO'])
  })
  it('gives admin teacher navigation and preserves multiple roles', () => {
    const roles = rolesFromProfile({ 'cognito:groups': ['ADMIN', 'participante'] })
    expect(roles).toEqual(['ADMIN', 'DOCENTE', 'PARTICIPANTE'])
    expect(primaryRole(roles)).toBe('ADMIN')
  })
  it('defaults to participant without elevating unknown or malformed groups', () => {
    expect(rolesFromProfile({ 'cognito:groups': ['unknown', 3] })).toEqual(['PARTICIPANTE'])
    expect(rolesFromProfile({ 'cognito:groups': 'ADMIN' })).toEqual(['PARTICIPANTE'])
  })
  it('restricts project navigation and direct access to teachers', () => {
    const projects = modules.find(module => module.slug === 'proyectos')!
    expect(canAccess(projects, ['PARTICIPANTE'])).toBe(false)
    expect(canAccess(projects, ['VOLUNTARIO'])).toBe(false)
    expect(canAccess(projects, ['DOCENTE'])).toBe(true)
    expect(availableModules(['PARTICIPANTE']).map(module => module.slug)).toEqual(['eventos', 'inscripciones'])
  })
  it('never greets users by their subject identifier', () => {
    expect(displayName({ name: ' Ana ', sub: 'identifier' })).toBe('Ana')
    expect(displayName({ sub: 'identifier' })).toBe('Usuario')
  })
  it('uses the exact Cognito sign-out URL', () => {
    const url = new URL(logoutUrl('https://cognito.example', 'web-client', 'http://localhost:5173/'))
    expect(url.pathname).toBe('/logout')
    expect(url.searchParams.get('logout_uri')).toBe('http://localhost:5173/')
    expect(url.searchParams.get('client_id')).toBe('web-client')
    expect(url.searchParams.has('redirect_uri')).toBe(false)
  })
})
