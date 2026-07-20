import { OAuthError, createOAuthErrorFromQuery } from 'utils'
import { confirmWithGrant, readAndClearGrant } from 'utils/oauthGrantHandoff'
import { useEffect, useState } from 'react'

import { Button } from '@apideck/components'
import { OAuthErrorAlert } from 'components'

/**
 * OAuth popup callback. Fallback ladder (highest rung wins):
 *   1. Grant self-confirm (new): if a single-use grant is stored for this
 *      service_id and the hash carries confirm_token + service_id + unified_api,
 *      redeem `{ confirm_token, grant }` UNAUTHENTICATED in-tab (the grant is the
 *      auth — nonce-independent) and close. On any failure, fall through.
 *   2. Legacy opener relay (unchanged): post `oauth_complete` to window.opener
 *      when nonce + confirm_token + service_id + opener are present, then close.
 *   3. Error relay / in-page server error (unchanged).
 *   4. Null-opener strand: a success-shaped hash (nonce + confirm_token +
 *      service_id) with no opener now renders a loud error instead of a silent
 *      close; any other hash still closes silently.
 *
 * Deployment order: unify (grant mint + `/confirm` accepting `{ confirm_token,
 * grant }` + `unified_api` in the callback fragment) → this leg → vault-core
 * widget. Until unify ships, the grant/`unified_api` are absent and this page
 * degrades to the legacy opener relay.
 */
const CallbackPage = ({ hasError, query }: { hasError: boolean; query: any }) => {
  const [oauthError, setOAuthError] = useState<OAuthError | null>(null)
  const [loudError, setLoudError] = useState(false)

  useEffect(() => {
    // Success params arrive in the URL fragment (not query) after unify Fix 3.
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const nonce = hashParams.get('nonce')
    const confirm_token = hashParams.get('confirm_token')
    const service_id = hashParams.get('service_id')
    const unified_api = hashParams.get('unified_api')

    const confirmOAuth = async () => {
      // Rung 1: grant self-confirm (nonce-independent — the grant is the auth).
      // readAndClearGrant is single-use: the grant is consumed even if the guard
      // below is false (e.g. unify has not yet shipped unified_api).
      const grant = service_id ? readAndClearGrant(service_id) : null

      if (grant && confirm_token && service_id && unified_api) {
        try {
          await confirmWithGrant({
            unifiedApi: unified_api,
            serviceId: service_id,
            confirmToken: confirm_token,
            grant
          })
          window.close()
          return
        } catch {
          // Grant redemption failed (expired/used/invalid, or unify not ready):
          // fall through to the legacy fallback ladder below.
        }
      }

      // Fallback ladder (also reached when no grant attempt was made).
      if (nonce && confirm_token && service_id && window.opener) {
        // Rung 2: legacy opener relay (gate unchanged — still requires nonce).
        window.opener.postMessage(
          {
            type: 'oauth_complete',
            nonce,
            confirmToken: confirm_token,
            serviceId: service_id,
            success: true
          },
          '*'
        )
        window.close()
      } else if (query?.error_type && window.opener) {
        // Error params remain in query — not moved to fragment.
        window.opener.postMessage(
          {
            type: 'oauth_error',
            error: query.error_type,
            errorDescription: query.error_message,
            serviceId: query.service_id
          },
          '*'
        )
        window.close()
      } else if (hasError) {
        setOAuthError(createOAuthErrorFromQuery(query))
      } else if (nonce && confirm_token && service_id) {
        // Success-shaped hash but no opener (and no successful grant self-confirm):
        // loud error instead of the old silent close.
        setLoudError(true)
      } else {
        window.close()
      }
    }

    confirmOAuth()
  }, [hasError, query])

  return (
    <div className="flex flex-col justify-between">
      {oauthError ? <OAuthErrorAlert error={oauthError} /> : null}
      {loudError ? (
        <p className="mb-4">
          The authorization could not be completed in this window. Please close this window and try
          again.
        </p>
      ) : null}
      {hasError || loudError ? (
        <Button
          text="Close window"
          size="larger"
          className="w-full"
          onClick={() => window.close()}
        />
      ) : null}
    </div>
  )
}

export const getServerSideProps = async ({ query }: any): Promise<any> => {
  const hasError = !!(query?.error_type || query?.error_message)
  return { props: { hasError, query: query || {} } }
}

export default CallbackPage
