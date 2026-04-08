import { OAuthError, createOAuthErrorFromQuery } from 'utils'
import { useEffect, useState } from 'react'

import { Button } from '@apideck/components'
import { OAuthErrorAlert } from 'components'

const CallbackPage = ({ hasError, query }: { hasError: boolean; query: any }) => {
  const [oauthError, setOAuthError] = useState<OAuthError | null>(null)

  useEffect(() => {
    // Success params now arrive in URL fragment (not query) after unify Fix 3
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const nonce = hashParams.get('nonce')
    const confirm_token = hashParams.get('confirm_token')
    const service_id = hashParams.get('service_id')

    if (nonce && confirm_token && service_id && window.opener) {
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
      // Error params remain in query — not moved to fragment
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
    } else {
      window.close()
    }
  }, [hasError, query])

  return (
    <div className="flex flex-col justify-between">
      {oauthError ? <OAuthErrorAlert error={oauthError} /> : null}
      {hasError ? (
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
