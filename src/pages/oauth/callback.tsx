import { OAuthError, createOAuthErrorFromQuery } from 'utils'
import { useEffect, useState } from 'react'

import { Button } from '@apideck/components'
import { OAuthErrorAlert } from 'components'

const CallbackPage = ({ hasError, query }: { hasError: boolean; query: any }) => {
  const [oauthError, setOAuthError] = useState<OAuthError | null>(null)

  useEffect(() => {
    if (hasError) {
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
  return { props: { hasError: query && Object.keys(query).length > 0, query } }
}

export default CallbackPage
