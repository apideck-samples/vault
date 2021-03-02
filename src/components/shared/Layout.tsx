import { Transition } from 'components'
import MenuLeftIcon from 'mdi-react/MenuLeftIcon'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { ThemeContext, ThemeContextType } from 'utils/context'

interface IProps {
  consumerMetadata: { [key: string]: string }
  redirectUri: string
  hideConsumerCard: boolean
}

const Layout: React.FC<IProps> = ({
  consumerMetadata,
  redirectUri,
  hideConsumerCard = false,
  children
}) => {
  const router = useRouter()
  const theme = useContext(ThemeContext) as ThemeContextType
  const {
    vault_name: vaultName,
    favicon,
    primary_color: primaryColor,
    terms_url: termsUrl,
    privacy_url: privacyUrl
  } = theme
  const { user_name: userName, account_name: accountName, image } = consumerMetadata
  const hasConsumerMetadata = Object.keys(consumerMetadata).length > 0

  return (
    <div
      className="flex h-screen bg-gray-100 border-t-4 border-primary"
      style={primaryColor ? { borderColor: primaryColor } : {}}
    >
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>{vaultName ? `${vaultName} Vault` : 'Apideck Vault'}</title>
        <link rel="icon" href={favicon ? favicon : '/favicon.ico'} />
      </Head>
      <aside
        className="flex flex-col justify-between w-1/3 px-8 pt-32 pb-12 overflow-y-scroll sm:px-12"
        style={{ minWidth: '400px', maxWidth: '480px' }}
      >
        <div>
          <div className="mb-10 text-2xl font-medium">{vaultName || 'Apideck Vault'}</div>
          <a
            className="inline-flex items-center text-sm text-gray-500 group hover:text-gray-800"
            href={redirectUri ? redirectUri : 'https://app.apideck.com'}
          >
            <span className="text-gray-600 group-hover:text-gray-800">
              <MenuLeftIcon
                className="transition duration-150 ease-in-out"
                color="currentColor"
                size={20}
              />
            </span>
            <span className="ml-2 leading-none transition duration-150 ease-in-out transform group-hover:-translate-x-1">
              Return to application
            </span>
          </a>
        </div>
        <div>
          {hasConsumerMetadata && !hideConsumerCard && (
            <div className="flex items-center justify-start w-full px-6 py-4 my-24 bg-white rounded-lg shadow">
              {image && (
                <img
                  className="mr-4 rounded-full"
                  style={{ height: '36px', width: '36px' }}
                  src={image}
                  title={userName ? userName : 'user'}
                  alt={userName ? userName : 'user'}
                />
              )}
              <div>
                {accountName && (
                  <div className="text-xs text-gray-500 uppercase">{accountName}</div>
                )}
                {userName && <div className="text-sm leading-none">{userName}</div>}
              </div>
            </div>
          )}
          <a
            className="inline-flex items-center mb-8"
            href="https://www.apideck.com/products/unify"
          >
            <span className="text-gray-600" style={{ fontSize: '0.8125rem' }}>
              Powered by
            </span>
            <img
              className="ml-2 mr-1"
              style={{ height: '18px', maxHeight: '18px' }}
              src="/logo-black.svg"
              title="Apideck"
              alt="Apideck logo"
            />
            <span className="text-sm leading-none text-gray-900 uppercase">Unify</span>
          </a>
          <ul>
            <li className="inline-block mr-6">
              <a
                className="text-gray-500 hover:text-gray-800"
                style={{ fontSize: '0.8125rem' }}
                href={
                  termsUrl
                    ? termsUrl
                    : 'https://termsfeed.com/terms-conditions/957c85c1b089ae9e3219c83eff65377e'
                }
              >
                Terms
              </a>
            </li>
            <li className="inline-block">
              <a
                className="text-gray-500 hover:text-gray-800"
                style={{ fontSize: '0.8125rem' }}
                href={privacyUrl ? privacyUrl : 'https://compliance.apideck.com/privacy-policy'}
              >
                Privacy
              </a>
            </li>
          </ul>
        </div>
      </aside>
      <main className="relative w-full px-20 overflow-x-hidden bg-white rounded-l-2xl shadow-main">
        <div className="flex flex-col max-w-4xl min-h-screen py-32 m-auto">
          <Transition location={router.pathname}>{children}</Transition>
        </div>
      </main>
    </div>
  )
}

export default Layout
