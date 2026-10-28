import { render, screen } from '../../../testUtils/testing-utils'

import { Layout } from 'components'
import { JWTSession } from 'types/JWTSession'
import { token } from '../../../fixtures/session'

let mockSession: Partial<JWTSession> | null = null

jest.mock('next/router', () => ({
  __esModule: true,
  default: { events: { on: jest.fn(), off: jest.fn() } },
  useRouter: jest.fn(() => ({ pathname: '/', query: {}, asPath: '/' }))
}))

jest.mock('utils/useSession', () => ({
  useSession: jest.fn(() => ({ session: mockSession, setSession: jest.fn() }))
}))

const DEFAULT_TERMS_URL = 'https://termsfeed.com/terms-conditions/957c85c1b089ae9e3219c83eff65377e'
const DEFAULT_PRIVACY_URL = 'https://compliance.apideck.com/privacy-policy'

const renderLayout = (session: Partial<JWTSession>) => {
  mockSession = session
  render(
    <Layout>
      <div>Page content</div>
    </Layout>
  )
}

const hrefOf = (name: string) => screen.getByRole('link', { name }).getAttribute('href')

describe('Layout', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    mockSession = null
  })

  describe('Return to application', () => {
    it('links Return to application to the session redirectUri', () => {
      renderLayout({ ...token, redirectUri: 'https://app.example.com/vault' })

      expect(hrefOf('Return to application')).toBe('https://app.example.com/vault')
    })

    it('falls back to https://app.apideck.com when the session has no redirectUri', () => {
      renderLayout({ ...token, redirectUri: undefined })

      expect(hrefOf('Return to application')).toBe('https://app.apideck.com')
    })

    it('hides Return to application when the session redirectUri is javascript:', () => {
      renderLayout({ ...token, redirectUri: 'javascript:alert(document.domain)' })

      expect(screen.getByText('Page content')).toBeTruthy()
      expect(screen.queryByRole('link', { name: 'Return to application' })).toBeNull()
    })
  })

  describe('Terms and Privacy', () => {
    it('uses the default Terms and Privacy URLs when the theme URLs are javascript:', () => {
      renderLayout({
        ...token,
        theme: {
          ...token.theme,
          termsUrl: 'javascript:alert(document.domain)',
          privacyUrl: 'javascript:alert(document.cookie)'
        }
      })

      expect(hrefOf('Terms')).toBe(DEFAULT_TERMS_URL)
      expect(hrefOf('Privacy')).toBe(DEFAULT_PRIVACY_URL)
    })

    it('uses the theme Terms and Privacy URLs when they are https', () => {
      renderLayout(token)

      expect(hrefOf('Terms')).toBe(token.theme.termsUrl)
      expect(hrefOf('Privacy')).toBe(token.theme.privacyUrl)
    })
  })
})
