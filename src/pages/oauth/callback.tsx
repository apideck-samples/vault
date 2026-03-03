import { OAuthError, createOAuthErrorFromQuery } from 'utils'
import { useEffect, useState } from 'react'

import { Button } from '@apideck/components'
import { OAuthErrorAlert } from 'components'

const CallbackPage = ({ hasError, query }: { hasError: boolean; query: any }) => {
  const [oauthError, setOAuthError] = useState<OAuthError | null>(null)

  useEffect(() => {
    const { nonce, confirm_token, service_id, error_type, error_message } = query || {}

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
    } else if (error_type && window.opener) {
      window.opener.postMessage(
        {
          type: 'oauth_error',
          error: error_type,
          errorDescription: error_message,
          serviceId: service_id
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
