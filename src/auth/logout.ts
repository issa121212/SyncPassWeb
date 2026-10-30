export function logoutUrl(domain: string, clientId: string, redirect: string): string {
  const url = new URL('/logout', domain)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('logout_uri', redirect)
  return url.toString()
}
