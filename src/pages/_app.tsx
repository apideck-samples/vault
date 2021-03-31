import '../styles/globals.css'

import { ErrorBlock, Layout, SessionExpiredModal } from 'components'
import React, { Fragment, useEffect, useState } from 'react'
import { SessionExpiredModalContext, ThemeContext } from 'utils/context'

import { AppProps } from 'next/app'
import { IConnection } from 'types/Connection'
import { applySession } from 'next-session'
import client from 'lib/axios'
import { defaults } from 'config/defaults'
import { options } from 'utils/sessionOptions'
import useSWR from 'swr'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const App = ({ Component, pageProps }: AppProps) => {
  const [connections, setConnections] = useState<IConnection[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<{ status: number } | null>(null)
  const [sessionExpired, setSessionExpired] = useState<boolean>(false)
  const { jwt, token } = pageProps
  let consumerMetadata = {}
  let theme = {}
  let redirectUri = ''

  if (token && Object.keys(token).length > 0) {
    consumerMetadata = token.consumerMetadata || defaults.consumerMetadata
    theme = token.theme || defaults.theme
    redirectUri = token.redirectUri
  }

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-APIDECK-APP-ID': token?.applicationId,
        'X-APIDECK-CONSUMER-ID': token?.consumerId
      }
    })
  }

  const options = {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  }

  const { data, error: connectionsError } = useSWR('/vault/connections', fetcher, options)

  useEffect(() => {
    if (data) {
      setConnections(data.data.data)
      setLoading(false)
    }
  }, [data])

  useEffect(() => {
    if (connectionsError) {
      const { response } = connectionsError
      const errorObj = response ? response : { status: 400 }

      setError(errorObj)
      setLoading(false)
    }
  }, [connectionsError])

  return (
    <Fragment>
      <ThemeContext.Provider value={theme}>
        <SessionExpiredModalContext.Provider value={{ sessionExpired, setSessionExpired }}>
          <Layout
            consumerMetadata={consumerMetadata}
            redirectUri={redirectUri}
            hideConsumerCard={!!error || sessionExpired || loading}
          >
            {error ? (
              <ErrorBlock error={error} token={token} />
            ) : (
              <Fragment>
                <Component
                  connections={connections}
                  setConnections={setConnections}
                  loading={loading}
                  {...pageProps}
                />
                <SessionExpiredModal
                  open={sessionExpired}
                  setOpen={setSessionExpired}
                  redirectUri={redirectUri}
                />
              </Fragment>
            )}
          </Layout>
        </SessionExpiredModalContext.Provider>
      </ThemeContext.Provider>
      <div id="modal" />
    </Fragment>
  )
}

export const getServerSideProps = async (appContext: any) => {
  const {
    ctx: { req, res, pathname }
  } = appContext

  await applySession(req, res, options)

  if (!req?.session?.jwt && pathname !== '/session/[jwt]') {
    res?.writeHead(301, { Location: 'https://app.apideck.com/signup' })
    res?.end()
  }

  return {}
}

export default App
