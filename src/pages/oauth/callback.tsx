import { Alert, OAuthErrorAlert } from 'components'
import { OAuthError, createOAuthErrorFromQuery } from 'utils'
import { useEffect, useState } from 'react'

import { Button } from '@apideck/components'
import { targetOrigin } from 'utils/safeUrl'

const LOST_OPENER_MESSAGE =
  'This window lost its connection to the app that opened it. Close it and start the connection again.'
const UNSAFE_TARGET_MESSAGE =
  'This window cannot safely hand the connection back to the app that opened it. Close it and start the connection again.'

type HandoffError = 'no_opener' | 'unsafe_target'

const HANDOFF_ERROR_MESSAGES: Record<HandoffError, string> = {
  no_opener: LOST_OPENER_MESSAGE,
  unsafe_target: UNSAFE_TARGET_MESSAGE
}

const CallbackPage = ({ hasError, query }: { hasError: boolean; query: any }) => {
  const [oauthError, setOAuthError] = useState<OAuthError | null>(null)
  const [handoffError, setHandoffError] = useState<HandoffError | null>(null)

  useEffect(() => {
    // Errors come first and are never posted to the opener: they carry no
    // target_origin, so the alert stays in this window (GH-9546 decision 1).
    if (hasError) {
      setOAuthError(createOAuthErrorFromQuery(query))
      return
    }

    // Under an enforced application, unify puts the success params in the fragment
    // (CallbackConnectionUseCase.ts): confirm_token, service_id, unified_api, then
    // optional nonce and target_origin.
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const confirmToken = hashParams.get('confirm_token')

    if (!confirmToken) {
      window.close()
      return
    }

    const serviceId = hashParams.get('service_id')
    const origin = targetOrigin(hashParams.get('target_origin'))

    if (!serviceId || !origin) {
      setHandoffError('unsafe_target')
      return
    }

    if (!window.opener) {
      setHandoffError('no_opener')
      return
    }

    const nonce = hashParams.get('nonce')
    const unifiedApi = hashParams.get('unified_api')

    window.opener.postMessage(
      {
        type: 'oauth_complete',
        confirmToken,
        serviceId,
        success: true,
        ...(nonce ? { nonce } : {}),
        ...(unifiedApi ? { unifiedApi } : {})
      },
      origin
    )
    window.close()
  }, [hasError, query])

  return (
    <div className="flex flex-col justify-between">
      {oauthError ? <OAuthErrorAlert error={oauthError} /> : null}
      {handoffError ? (
        <Alert
          title="Connection not completed"
          description={HANDOFF_ERROR_MESSAGES[handoffError]}
        />
      ) : null}
      {hasError || handoffError ? (
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
