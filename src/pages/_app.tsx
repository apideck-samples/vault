import '../styles/globals.css'

import { ModalProvider, ToastProvider } from '@apideck/components'
import React, { Fragment } from 'react'

import { AppProps } from 'next/app'
import { Layout } from 'components'
import { SessionProvider } from 'utils/useSession'

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Fragment>
      <SessionProvider>
        <ToastProvider>
          <ModalProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ModalProvider>
        </ToastProvider>
      </SessionProvider>

      <div id="modal" />
    </Fragment>
  )
}

export default App
