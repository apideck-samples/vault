import { OAuthError, createOAuthErrorFromQuery } from 'utils'
import { useEffect, useState } from 'react'

import { Button } from '@apideck/components'
import { OAuthErrorAlert } from 'components'

const CallbackPage = ({
  hasError,
  confirmToken,
  query
}: {
  hasError: boolean
  confirmToken: string | null
  query: any
}) => {
  const [oauthError, setOAuthError] = useState<OAuthError | null>(null)

  useEffect(() => {
    if (hasError) {
      setOAuthError(createOAuthErrorFromQuery(query))
    } else {
      if (confirmToken && window.opener) {
        window.opener.postMessage({ type: 'oauth-confirm', confirmToken }, '*')
      }
      window.close()
    }
  }, [hasError, confirmToken, query])

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
  const { confirm_token: confirmToken, ...rest } = query || {}
  const hasError = Boolean(rest.error_type || rest.error || rest.error_description)
  return { props: { hasError, confirmToken: confirmToken || null, query: rest } }
}

export default CallbackPage
