import '../styles/globals.css'

import { Layout, SessionExpiredModal } from 'components'
import { ModalProvider, ToastProvider } from '@apideck/components'
import React, { Fragment, useState } from 'react'
import { SessionExpiredModalContext, ThemeContext } from 'utils/context'

import { AppProps } from 'next/app'
import { applySession } from 'next-session'
import { defaults } from 'config/defaults'
import { options } from 'utils/sessionOptions'

const App = ({ Component, pageProps }: AppProps) => {
  const [sessionExpired, setSessionExpired] = useState<boolean>(false)
  const { token } = pageProps
  let consumerMetadata = {}
  let showLogs = true
  let showSuggestions = true
  const sandboxMode = token?.settings?.sandboxMode
  const isolationMode = token?.settings?.isolationMode
  const persistedTheme = typeof window !== 'undefined' && window.localStorage.getItem('theme')
  let theme = persistedTheme ? JSON.parse(persistedTheme) : {}
  let redirectUri = ''

  if (token && Object.keys(token).length > 0) {
    consumerMetadata = token.consumerMetadata || defaults.consumerMetadata
    redirectUri = token.redirectUri
    theme = token.theme || defaults.theme
    if (typeof window !== 'undefined') window.localStorage.setItem('theme', JSON.stringify(theme))

    if (token.settings) {
      if ('showLogs' in token.settings) {
        showLogs = token.settings.showLogs
      }
      if ('showSuggestions' in token.settings) {
        showSuggestions = token.settings.showSuggestions
      }
    }
  }

  return (
    <Fragment>
      <ThemeContext.Provider value={theme}>
        <SessionExpiredModalContext.Provider value={{ sessionExpired, setSessionExpired }}>
          <ToastProvider>
            <ModalProvider>
              <Layout
                consumerMetadata={consumerMetadata}
                redirectUri={redirectUri}
                hideConsumerCard={sessionExpired}
                showLogs={showLogs}
                showSuggestions={showSuggestions}
                sandboxMode={sandboxMode}
                isolationMode={isolationMode}
              >
                <Component {...pageProps} />
                <SessionExpiredModal
                  open={sessionExpired}
                  setOpen={setSessionExpired}
                  redirectUri={redirectUri}
                />
              </Layout>
            </ModalProvider>
          </ToastProvider>
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
