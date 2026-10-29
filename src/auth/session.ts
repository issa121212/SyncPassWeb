export function returnPath(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('returnTo' in state)) return '/app'
  const path = state.returnTo
  return typeof path === 'string' && /^\/app(?:[/?#]|$)/.test(path) && !path.includes('\\')
    ? path
    : '/app'
}
