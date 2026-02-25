import { OAuthError, createOAuthErrorFromQuery } from 'utils'
import { useEffect, useState } from 'react'

import { Button } from '@apideck/components'
import { OAuthErrorAlert } from 'components'

const CallbackPage = ({ hasError, query }: { hasError: boolean; query: any }) => {
  const [oauthError, setOAuthError] = useState<OAuthError | null>(null)
  const [showNoOpenerMessage, setShowNoOpenerMessage] = useState(false)

  useEffect(() => {
    if (hasError) {
      setOAuthError(createOAuthErrorFromQuery(query))
      return
    }

    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.slice(1))
      const nonce = params.get('nonce')
      const confirmToken = params.get('confirm_token')
      const serviceId = params.get('service_id')
      const error = params.get('error')
      const errorDescription = params.get('error_description')

      if (error) {
        if (window.opener) {
          window.opener.postMessage(
            { type: 'oauth_error', error, errorDescription, serviceId },
            '*'
          )
        }
        setOAuthError({
          message: errorDescription || error,
          ref: '',
          details: {
            error_type: error,
            error_message: errorDescription || '',
            origin: 'callback',
            service_id: serviceId || undefined
          }
        })
        return
      }

      if (nonce && confirmToken && serviceId) {
        if (window.opener) {
          window.opener.postMessage({ type: 'oauth_complete', nonce, confirmToken, serviceId }, '*')
          window.close()
        } else {
          setShowNoOpenerMessage(true)
        }
        return
      }
    }

    // Legacy flow: no fragments, no error — old vault-core polls for child.closed
    window.close()
  }, [hasError, query])

  return (
    <div className="flex flex-col justify-between">
      {oauthError ? <OAuthErrorAlert error={oauthError} /> : null}
      {hasError || oauthError ? (
        <Button
          text="Close window"
          size="larger"
          className="w-full"
          onClick={() => window.close()}
        />
      ) : null}
      {showNoOpenerMessage ? (
        <div className="p-6 text-center text-gray-700">
          <p>This page should be opened via Vault. Please close this window and try again.</p>
        </div>
      ) : null}
    </div>
  )
}

export const getServerSideProps = async ({ query }: any): Promise<any> => {
  return { props: { hasError: query && Object.keys(query).length > 0, query } }
}

export default CallbackPage
