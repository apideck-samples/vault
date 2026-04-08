import client from 'lib/axios'
import { IAuthorizeResponse, IConfirmResponse } from 'types/OAuthCsrf'

const NONCE_KEY_PREFIX = 'apideck_oauth_nonce_'

export function generateAndStoreNonce(serviceId: string): string {
  const nonce = crypto.randomUUID()
  sessionStorage.setItem(`${NONCE_KEY_PREFIX}${serviceId}`, nonce)
  return nonce
}

export function verifyAndClearNonce(serviceId: string, nonce: string): boolean {
  const stored = sessionStorage.getItem(`${NONCE_KEY_PREFIX}${serviceId}`)
  sessionStorage.removeItem(`${NONCE_KEY_PREFIX}${serviceId}`)
  return stored === nonce
}

export async function callAuthorizeEndpoint(params: {
  serviceId: string
  unifiedApi: string
  nonce: string
  redirectUri: string
  jwt: string
  applicationId: string
  consumerId: string
}): Promise<string> {
  const { serviceId, unifiedApi, nonce, redirectUri, jwt, applicationId, consumerId } = params

  const { data } = await client.post<IAuthorizeResponse>(
    `/vault/connections/${unifiedApi}/${serviceId}/authorize`,
    { nonce, redirect_uri: redirectUri },
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-APIDECK-APP-ID': applicationId,
        'X-APIDECK-CONSUMER-ID': consumerId
      }
    }
  )

  return data.data.authorize_url
}

export async function callConfirmEndpoint(params: {
  serviceId: string
  unifiedApi: string
  confirmToken: string
  jwt: string
  applicationId: string
  consumerId: string
}): Promise<IConfirmResponse> {
  const { serviceId, unifiedApi, confirmToken, jwt, applicationId, consumerId } = params

  const { data } = await client.post<IConfirmResponse>(
    `/vault/connections/${unifiedApi}/${serviceId}/confirm`,
    { confirm_token: confirmToken },
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-APIDECK-APP-ID': applicationId,
        'X-APIDECK-CONSUMER-ID': consumerId
      }
    }
  )

  return data
}
