import client from 'lib/axios'
import { IGrantConfirmResponse } from 'types/OAuthGrantHandoff'

/**
 * Grant-handoff util (vault leg of the forward OAuth confirm handoff).
 *
 * Invariants:
 * - The grant is NEVER carried in any URL. It travels only over the live opener
 *   `postMessage` handshake into the launch page and then only through tab
 *   `sessionStorage`.
 * - The grant is single-use: `readAndClearGrant` reads and removes in one step.
 * - `confirmWithGrant` is UNAUTHENTICATED — it sends no `Authorization` /
 *   `X-APIDECK-APP-ID` / `X-APIDECK-CONSUMER-ID` headers (the grant is the auth).
 *   Contrast `callConfirmEndpoint` (`utils/oauthCsrf.ts`).
 * - Only `pages/oauth/launch.tsx` (writer) and `pages/oauth/callback.tsx`
 *   (reader/confirmer) consume this module.
 */

export const GRANT_KEY_PREFIX = 'apideck_oauth_grant_'
export const OAUTH_LAUNCH_READY = 'oauth_launch_ready'
export const OAUTH_LAUNCH_START = 'oauth_launch_start'
export const READY_REPEAT_INTERVAL_MS = 250

const PROBE_KEY = 'apideck_oauth_storage_probe'

export function storeGrant(serviceId: string, grant: string): void {
  sessionStorage.setItem(`${GRANT_KEY_PREFIX}${serviceId}`, grant)
}

export function readAndClearGrant(serviceId: string): string | null {
  const key = `${GRANT_KEY_PREFIX}${serviceId}`
  const grant = sessionStorage.getItem(key)
  sessionStorage.removeItem(key)
  return grant
}

export function probeSessionStorage(): boolean {
  try {
    const probe = `${PROBE_KEY}_${GRANT_KEY_PREFIX}`
    sessionStorage.setItem(PROBE_KEY, probe)
    const readBack = sessionStorage.getItem(PROBE_KEY)
    sessionStorage.removeItem(PROBE_KEY)
    return readBack === probe
  } catch {
    return false
  }
}

export async function confirmWithGrant(params: {
  unifiedApi: string
  serviceId: string
  confirmToken: string
  grant: string
}): Promise<IGrantConfirmResponse> {
  const { unifiedApi, serviceId, confirmToken, grant } = params

  const { data } = await client.post<IGrantConfirmResponse>(
    `/vault/connections/${unifiedApi}/${serviceId}/confirm`,
    { confirm_token: confirmToken, grant }
  )

  return data
}
