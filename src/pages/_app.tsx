import 'styles/index.css'

import { ModalProvider, ToastProvider } from '@apideck/components'
import React, { Fragment, useState } from 'react'

import { AppProps } from 'next/app'
import { Layout } from 'components'
import { SessionExpiredModalContext } from 'utils/context'
import { SessionProvider } from 'utils/useSession'

const App = ({ Component, pageProps }: AppProps) => {
  const [sessionExpired, setSessionExpired] = useState<boolean>(false)

  return (
    <Fragment>
      <SessionExpiredModalContext.Provider value={{ sessionExpired, setSessionExpired }}>
        <SessionProvider>
          <ToastProvider>
            <ModalProvider>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ModalProvider>
          </ToastProvider>
        </SessionProvider>
      </SessionExpiredModalContext.Provider>
      <div id="modal" />
    </Fragment>
  )
}

export default App
