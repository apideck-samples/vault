import '../styles/globals.css'

import { Layout, SessionExpiredModal } from 'components'
import { ModalProvider, ToastProvider } from '@apideck/components'
import React, { Fragment, useState } from 'react'
import { SessionExpiredModalContext, ThemeContext } from 'utils/context'
import { SessionProvider, useSession } from 'utils/useSession'

import { AppProps } from 'next/app'
import { defaults } from 'config/defaults'

const App = ({ Component, pageProps }: AppProps) => {
  const [sessionExpired, setSessionExpired] = useState<boolean>(false)
  const { session } = useSession()

  let consumerMetadata = {}
  let showLogs: boolean | undefined = true
  let showSuggestions: boolean | undefined = false
  const sandboxMode = session?.settings?.sandboxMode
  const isolationMode = session?.settings?.isolationMode
  const persistedTheme = typeof window !== 'undefined' && window.localStorage.getItem('theme')
  let theme = persistedTheme ? JSON.parse(persistedTheme) : {}
  let redirectUri = ''

  if (session && Object.keys(session).length > 0) {
    consumerMetadata = session.consumerMetadata || defaults.consumerMetadata
    redirectUri = session.redirectUri
    theme = session.theme || defaults.theme
    if (typeof window !== 'undefined') window.localStorage.setItem('theme', JSON.stringify(theme))

    if (session.settings) {
      if ('showLogs' in session.settings) {
        showLogs = session.settings?.showLogs
      }
      if ('showSuggestions' in session.settings) {
        showSuggestions = session.settings.showSuggestions
      }
    }
  }

  return (
    <Fragment>
      <ThemeContext.Provider value={theme}>
        <SessionExpiredModalContext.Provider value={{ sessionExpired, setSessionExpired }}>
          <SessionProvider>
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
          </SessionProvider>
        </SessionExpiredModalContext.Provider>
      </ThemeContext.Provider>
      <div id="modal" />
    </Fragment>
  )
}

export default App
