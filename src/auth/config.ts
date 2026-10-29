import { WebStorageStateStore } from 'oidc-client-ts'
import type { AuthProviderProps } from 'react-oidc-context'
import { returnPath } from './session'

export const cognito = {
  authority: import.meta.env.VITE_COGNITO_ISSUER || 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_qf9qh3X5q',
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '4pp1hrlitnamn0pl2es7e8ejmn',
  redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI || `${window.location.origin}/auth/callback`,
}

export const authConfig: AuthProviderProps = {
  authority: cognito.authority,
  client_id: cognito.clientId,
  redirect_uri: cognito.redirectUri,
  response_type: 'code',
  // With Cognito, openid alone returns the client-readable user attributes.
  scope: 'openid',
  disablePKCE: false,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
  automaticSilentRenew: true,
  loadUserInfo: false,
  monitorSession: false,
  onSigninCallback(user) {
    window.history.replaceState({}, document.title, returnPath(user?.state))
    window.dispatchEvent(new PopStateEvent('popstate'))
  },
}
