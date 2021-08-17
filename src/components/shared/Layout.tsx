import classNames from 'classnames'
import { Transition } from 'components'
import Head from 'next/head'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import { FiCompass } from 'react-icons/fi'
import { HiChevronLeft, HiHome, HiOutlineDocumentText } from 'react-icons/hi'
import { ThemeContext, ThemeContextType } from 'utils/context'
import SandboxBanner from './SandboxBanner'

interface IProps {
  consumerMetadata: { [key: string]: string }
  showLogs: boolean
  redirectUri: string
  hideConsumerCard: boolean
  sandboxMode: boolean
}

const Layout: React.FC<IProps> = ({
  consumerMetadata,
  redirectUri,
  hideConsumerCard = false,
  showLogs,
  sandboxMode = false,
  children
}) => {
  const router = useRouter()
  const theme = useContext(ThemeContext) as ThemeContextType
  const [customStyles, setCustomStyles] = useState<any>({ backgroundColor: '#edf2f7' })
  const [customTextColor, setCustomTextColor] = useState('')
  const [navIsOpen, setNavIsOpen] = useState(false)

  const {
    vault_name: vaultName,
    favicon,
    logo,
    primary_color: primaryColor,
    terms_url: termsUrl,
    privacy_url: privacyUrl,
    sidepanel_background_color: bgColor,
    sidepanel_text_color: textColor
  } = theme
  const { user_name: userName, account_name: accountName, image } = consumerMetadata
  const hasConsumerMetadata = Object.keys(consumerMetadata).length > 0

  useEffect(() => {
    const styles = { ...customStyles } as any
    if (primaryColor) styles.borderColor = primaryColor
    if (bgColor) styles.backgroundColor = bgColor
    setCustomStyles(styles)
    if (textColor) setCustomTextColor(textColor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgColor, primaryColor, textColor])

  useEffect(() => {
    if (!navIsOpen) return
    function handleRouteChange() {
      setNavIsOpen(false)
    }
    Router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [navIsOpen])

  return (
    <div>
      <Head>
        <meta
          name="viewport"
          content={
            'user-scalable=0, initial-scale=1, ' +
            'minimum-scale=1, width=device-width, height=device-height'
          }
        />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>{vaultName ? `${vaultName} Vault` : 'Apideck Vault'}</title>
        <link rel="icon" href={favicon ? favicon : '/favicon.ico'} />
      </Head>
      <div
        className="p-3 px-4 sm:px-8 md:px-12 lg:hidden"
        style={{
          backgroundColor: bgColor ? bgColor : '#edf2f7',
          color: customTextColor ? customTextColor : '#1f2937'
        }}
      >
        <div className="flex items-center justify-between">
          {logo ? (
            <img className="h-6 rounded" src={logo} alt={vaultName || 'Apideck Vault'} />
          ) : (
            <div className="font-medium text-md">{vaultName || 'Apideck Vault'}</div>
          )}

          <button
            type="button"
            className="relative w-8 h-8 lg:hidden"
            style={{
              color: customTextColor ? customTextColor : '#1f2937'
            }}
            onClick={() => setNavIsOpen(!navIsOpen)}
          >
            <span className="sr-only">Open site navigation</span>
            <svg
              width="24"
              height="24"
              fill="none"
              className={classNames(
                'absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform',
                {
                  'opacity-0 scale-80': navIsOpen
                }
              )}
            >
              <path
                d="M4 8h16M4 16h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              width="24"
              height="24"
              fill="none"
              className={classNames(
                'absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform',
                {
                  'opacity-0 scale-80': !navIsOpen
                }
              )}
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="flex overflow-hidden transition duration-300 lg:relative lg:h-screen lg:bg-gray-100 lg:border-t-4 border-main"
        style={customStyles}
      >
        <div
          id="sidebar"
          onClick={() => setNavIsOpen(false)}
          className={classNames(
            'fixed z-10 inset-0 flex-none h-full bg-opacity-25 w-full lg:static lg:h-auto lg:pt-0 lg:w-80 2xl:w-96 lg:block',
            {
              hidden: !navIsOpen
            }
          )}
        >
          <aside
            style={navIsOpen ? { background: customStyles.backgroundColor } : {}}
            className={classNames(
              'flex flex-col justify-between px-4 sm:px-8 pt-3  lg:pt-32 pb-10 sm:pb-12 overflow-y-auto min-h-screen',
              {
                'bg-gray-100': navIsOpen
              }
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex justify-end pb-20 lg:hidden">
                <button
                  type="button"
                  className="relative w-8 h-8"
                  style={{
                    color: textColor ? textColor : '#1f2937'
                  }}
                  onClick={() => setNavIsOpen(!navIsOpen)}
                >
                  <span className="sr-only">Open site navigation</span>
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    className={
                      'absolute top-1/2 left-1/2 -mt-3 -ml-3 transition duration-300 transform'
                    }
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <Link href="/">
                <a>
                  {logo ? (
                    <img
                      className="mb-12 rounded"
                      src={logo}
                      alt={vaultName || 'Apideck Vault'}
                      style={{ maxHeight: '28px' }}
                    />
                  ) : (
                    <div
                      className="mb-12 text-2xl font-medium"
                      style={customTextColor ? { color: customTextColor } : {}}
                    >
                      {vaultName || 'Apideck Vault'}
                    </div>
                  )}
                </a>
              </Link>
              <Link href="/">
                <a
                  className={classNames(
                    'flex items-center mb-6 text-sm  group hover:text-gray-800',
                    {
                      'text-gray-800': router.pathname === '/',
                      'text-gray-500': router.pathname !== '/'
                    }
                  )}
                  style={customTextColor ? { color: customTextColor } : {}}
                >
                  <HiHome color={customTextColor ? customTextColor : 'currentColor'} size={20} />
                  <span className="ml-3 leading-none transition duration-150 ease-in-out transform group-hover:-translate-x-0.5">
                    Integrations
                  </span>
                </a>
              </Link>
              <Link href="/suggestions">
                <a
                  className={classNames(
                    'flex items-center mb-6 text-sm group hover:text-gray-800',
                    {
                      'text-gray-800': router.pathname === '/suggestions',
                      'text-gray-500': router.pathname !== '/suggestions'
                    }
                  )}
                  style={customTextColor ? { color: customTextColor } : {}}
                >
                  <FiCompass color={customTextColor ? customTextColor : 'currentColor'} size={20} />

                  <span className="ml-3 leading-none transition duration-150 ease-in-out transform group-hover:-translate-x-0.5">
                    Suggestions
                  </span>
                </a>
              </Link>
              {showLogs ? (
                <Link href="/logs">
                  <a
                    className={classNames(
                      'flex items-center mb-6 text-sm  group hover:text-gray-800',
                      {
                        'text-gray-800': router.pathname === '/logs',
                        'text-gray-500': router.pathname !== '/logs'
                      }
                    )}
                    style={customTextColor ? { color: customTextColor } : {}}
                  >
                    <HiOutlineDocumentText
                      color={customTextColor ? customTextColor : 'currentColor'}
                      size={20}
                    />
                    <span className="ml-3 leading-none transition duration-150 ease-in-out transform group-hover:-translate-x-0.5">
                      Logs
                    </span>
                  </a>
                </Link>
              ) : (
                ''
              )}
              <a
                className="flex items-center text-sm text-gray-500 group hover:text-gray-800"
                href={redirectUri ? redirectUri : 'https://app.apideck.com'}
                style={customTextColor ? { color: customTextColor } : {}}
              >
                <HiChevronLeft
                  className="text-gray-600 transition duration-150 ease-in-out group-hover:text-gray-800"
                  color={customTextColor ? customTextColor : 'currentColor'}
                  size={20}
                />

                <span className="ml-3 leading-none transition duration-150 ease-in-out transform group-hover:-translate-x-0.5">
                  Return to application
                </span>
              </a>
            </div>
            <div>
              {hasConsumerMetadata && !hideConsumerCard && (
                <div className="flex items-center justify-start px-5 py-4 my-12 bg-white rounded-lg shadow md:my-24">
                  {image && (
                    <img
                      className="mr-3 rounded-full"
                      style={{ height: '36px', width: '36px' }}
                      src={image}
                      title={userName ? userName : 'user'}
                      alt={userName ? userName : 'user'}
                    />
                  )}
                  <div className="truncate">
                    {accountName && (
                      <div className="mb-2 text-xs text-gray-500 uppercase truncate">
                        {accountName}
                      </div>
                    )}
                    {userName && <div className="text-sm leading-none truncate">{userName}</div>}
                  </div>
                </div>
              )}
              <a
                className="inline-flex items-center mb-8"
                href="https://www.apideck.com/products/vault"
              >
                <span
                  className="text-sm text-gray-600"
                  style={customTextColor ? { color: customTextColor } : {}}
                >
                  Powered by
                </span>
                <svg
                  className="ml-2 mr-1"
                  width="95"
                  height="23"
                  viewBox="0 0 95 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m1.2 9.05c0.05-0.8333 0.25833-1.525 0.625-2.075s0.83333-0.9917 1.4-1.325 1.2-0.5667 1.9-0.7c0.71667-0.15 1.4333-0.225 2.15-0.225 0.65 0 1.3083 0.05 1.975 0.15 0.66667 0.0833 1.275 0.2583 1.825 0.525s1 0.6417 1.35 1.125c0.35 0.4667 0.525 1.0917 0.525 1.875v6.725c0 0.5833 0.0333 1.1417 0.1 1.675s0.1833 0.9333 0.35 1.2h-3.6c-0.06667-0.2-0.125-0.4-0.175-0.6-0.03333-0.2167-0.05833-0.4333-0.075-0.65-0.56667 0.5833-1.2333 0.9917-2 1.225s-1.55 0.35-2.35 0.35c-0.61667 0-1.1917-0.075-1.725-0.225s-1-0.3833-1.4-0.7-0.71667-0.7167-0.95-1.2c-0.21667-0.4833-0.325-1.0583-0.325-1.725 0-0.7333 0.125-1.3333 0.375-1.8 0.26667-0.4833 0.6-0.8667 1-1.15 0.41667-0.2833 0.88333-0.4917 1.4-0.625 0.53333-0.15 1.0667-0.2667 1.6-0.35s1.0583-0.15 1.575-0.2 0.975-0.125 1.375-0.225 0.71667-0.24171 0.95-0.42501c0.23333-0.2 0.34167-0.4833 0.325-0.85 0-0.3833-0.06667-0.6833-0.2-0.9-0.11667-0.2333-0.28333-0.4083-0.5-0.525-0.2-0.1333-0.44167-0.2167-0.725-0.25-0.26667-0.05-0.55833-0.075-0.875-0.075-0.7 0-1.25 0.15-1.65 0.45s-0.63333 0.8-0.7 1.5h-3.55zm8.2 2.625c-0.15 0.1333-0.34167 0.2417-0.575 0.325-0.21667 0.0667-0.45833 0.125-0.725 0.175-0.25 0.05-0.51667 0.0917-0.8 0.125s-0.56667 0.075-0.85 0.125c-0.26667 0.05-0.53333 0.1167-0.8 0.2-0.25 0.0833-0.475 0.2-0.675 0.35-0.18333 0.1333-0.33333 0.3083-0.45 0.525s-0.175 0.4917-0.175 0.825c0 0.3167 0.05833 0.5833 0.175 0.8s0.275 0.3917 0.475 0.525c0.2 0.1167 0.43333 0.2 0.7 0.25s0.54167 0.075 0.825 0.075c0.7 0 1.2417-0.1167 1.625-0.35s0.66667-0.5083 0.85-0.825c0.18333-0.3333 0.29167-0.6667 0.325-1 0.05-0.3333 0.075-0.6 0.075-0.8v-1.325zm12.83 4c-0.5667 0-1.05-0.1167-1.45-0.35s-0.725-0.5333-0.975-0.9c-0.2334-0.3833-0.4084-0.825-0.525-1.325-0.1-0.5-0.15-1.0083-0.15-1.525 0-0.5333 0.05-1.05 0.15-1.55 0.1-0.50001 0.2666-0.94171 0.5-1.325 0.25-0.3833 0.5666-0.6917 0.95-0.925 0.4-0.25 0.8916-0.375 1.475-0.375 0.5666 0 1.0416 0.125 1.425 0.375 0.4 0.2333 0.725 0.55001 0.975 0.95 0.25 0.3833 0.425 0.825 0.525 1.325 0.1166 0.5 0.175 1.0083 0.175 1.525s-0.05 1.025-0.15 1.525-0.275 0.9417-0.525 1.325c-0.2334 0.3667-0.55 0.6667-0.95 0.9-0.3834 0.2333-0.8667 0.35-1.45 0.35zm-6.525-10.6v17.45h3.55v-6.125h0.05c0.4333 0.6333 0.9833 1.1167 1.65 1.45 0.6833 0.3167 1.425 0.475 2.225 0.475 0.95 0 1.775-0.1833 2.475-0.55 0.7166-0.3667 1.3083-0.8583 1.775-1.475 0.4833-0.6167 0.8416-1.325 1.075-2.125 0.2333-0.8 0.35-1.6333 0.35-2.5 0-0.9167-0.1167-1.7917-0.35-2.625-0.2334-0.85-0.5917-1.5917-1.075-2.225-0.4834-0.6333-1.0917-1.1417-1.825-1.525-0.7334-0.3833-1.6084-0.575-2.625-0.575-0.8 0-1.5334 0.1583-2.2 0.475-0.6667 0.3167-1.2167 0.825-1.65 1.525h-0.05v-1.65h-3.375zm18.933-2v-2.925h-3.55v2.925h3.55zm-3.55 2v12.925h3.55v-12.925h-3.55zm15.52 6.425c0 0.5333-0.05 1.05-0.15 1.55s-0.2667 0.95-0.5 1.35c-0.2333 0.3833-0.55 0.6917-0.95 0.925-0.3833 0.2333-0.8667 0.35-1.45 0.35-0.55 0-1.025-0.1167-1.425-0.35-0.3833-0.25-0.7083-0.5667-0.975-0.95-0.25-0.4-0.4333-0.85-0.55-1.35s-0.175-1-0.175-1.5c0-0.5333 0.05-1.0417 0.15-1.525 0.1167-0.5 0.2917-0.9417 0.525-1.325 0.25-0.3833 0.575-0.6917 0.975-0.925s0.8917-0.35 1.475-0.35 1.0667 0.1167 1.45 0.35 0.6917 0.5417 0.925 0.925c0.25 0.3667 0.425 0.8 0.525 1.3 0.1 0.48331 0.15 0.99171 0.15 1.525zm0.05 4.85v1.65h3.375v-17.85h-3.55v6.5h-0.05c-0.4-0.6333-0.95-1.1083-1.65-1.425-0.6833-0.3333-1.4083-0.5-2.175-0.5-0.95 0-1.7833 0.1917-2.5 0.575-0.7167 0.3667-1.3167 0.8583-1.8 1.475-0.4667 0.6167-0.825 1.3333-1.075 2.15-0.2333 0.8-0.35 1.6333-0.35 2.5 0 0.9 0.1167 1.7667 0.35 2.6 0.25 0.8333 0.6083 1.575 1.075 2.225 0.4833 0.6333 1.0917 1.1417 1.825 1.525 0.7333 0.3667 1.5833 0.55 2.55 0.55 0.85 0 1.6083-0.15 2.275-0.45 0.6833-0.3167 1.2333-0.825 1.65-1.525h0.05zm14.758-6.2h-5.775c0.0167-0.25001 0.0667-0.53331 0.15-0.85001 0.1-0.3167 0.2583-0.6167 0.475-0.9 0.2333-0.2833 0.5333-0.5167 0.9-0.7 0.3833-0.2 0.8583-0.3 1.425-0.3 0.8667 0 1.5083 0.2333 1.925 0.7 0.4333 0.4667 0.7333 1.15 0.9 2.05zm-5.775 2.25h9.325c0.0667-1-0.0167-1.9583-0.25-2.875-0.2333-0.9167-0.6167-1.7333-1.15-2.45-0.5167-0.7167-1.1833-1.2833-2-1.7-0.8167-0.4333-1.775-0.65-2.875-0.65-0.9833 0-1.8833 0.175-2.7 0.525-0.8 0.35-1.4917 0.8333-2.075 1.45-0.5833 0.6-1.0333 1.3167-1.35 2.15s-0.475 1.7333-0.475 2.7c0 1 0.15 1.9167 0.45 2.75 0.3167 0.8333 0.7583 1.55 1.325 2.15s1.2583 1.0667 2.075 1.4c0.8167 0.3167 1.7333 0.475 2.75 0.475 1.4667 0 2.7167-0.3333 3.75-1s1.8-1.775 2.3-3.325h-3.125c-0.1167 0.4-0.4333 0.7833-0.95 1.15-0.5167 0.35-1.1333 0.525-1.85 0.525-1 0-1.7667-0.2583-2.3-0.775s-0.825-1.35-0.875-2.5zm20.23-2.775h3.475c-0.05-0.8333-0.25-1.55-0.6-2.15-0.35-0.6167-0.8084-1.125-1.375-1.525-0.55-0.4167-1.1834-0.725-1.9-0.925-0.7-0.2-1.4334-0.3-2.2-0.3-1.05 0-1.9834 0.175-2.8 0.525-0.8167 0.35-1.5084 0.8417-2.075 1.475-0.5667 0.6167-1 1.3583-1.3 2.225-0.2834 0.85-0.425 1.775-0.425 2.775 0 0.9667 0.1583 1.8583 0.475 2.675 0.3166 0.8 0.7583 1.4917 1.325 2.075 0.5666 0.5833 1.25 1.0417 2.05 1.375 0.8166 0.3167 1.7083 0.475 2.675 0.475 1.7166 0 3.125-0.45 4.225-1.35s1.7666-2.2083 2-3.925h-3.425c-0.1167 0.8-0.4084 1.4417-0.875 1.925-0.45 0.4667-1.1 0.7-1.95 0.7-0.55 0-1.0167-0.125-1.4-0.375-0.3834-0.25-0.6917-0.5667-0.925-0.95-0.2167-0.4-0.375-0.8417-0.475-1.325s-0.15-0.9583-0.15-1.425c0-0.4833 0.05-0.9667 0.15-1.45 0.1-0.50001 0.2666-0.95001 0.5-1.35 0.25-0.4167 0.5666-0.75 0.95-1 0.3833-0.2667 0.8583-0.4 1.425-0.4 1.5166 0 2.3916 0.7417 2.625 2.225zm5.8804-9.475v17.85h3.55v-4.45l1.375-1.325 3.55 5.775h4.3l-5.425-8.175 4.875-4.75h-4.2l-4.475 4.65v-9.575h-3.55z"
                    fill={customTextColor ? customTextColor : 'currentColor'}
                  />
                </svg>
              </a>
              <ul className={sandboxMode ? 'pb-4' : ''}>
                <li className="inline-block mr-6">
                  <a
                    className="text-sm text-gray-500 hover:text-gray-800"
                    style={customTextColor ? { color: customTextColor } : {}}
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
                    className="text-sm text-gray-500 hover:text-gray-800"
                    style={customTextColor ? { color: customTextColor } : {}}
                    href={privacyUrl ? privacyUrl : 'https://compliance.apideck.com/privacy-policy'}
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </aside>
        </div>
        <main
          className={classNames(
            'relative w-full lg:px-20 lg:overflow-x-hidden bg-white lg:rounded-l-2xl rounded-tl-2xl lg:shadow-main',
            { 'lg:overflow-hidden max-h-screen fixed': navIsOpen }
          )}
        >
          {sandboxMode ? <SandboxBanner /> : null}
          <div className="flex flex-col max-w-4xl py-8 mx-4 sm:py-16 sm:mx-8 md:mx-12 lg:m-auto lg:py-32">
            <Transition location={router.pathname}>{children}</Transition>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
