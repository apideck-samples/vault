import { act, fireEvent, render, screen, waitFor } from '../../../testUtils/testing-utils'
import { jwt, token } from '../../../fixtures/session'

import { ConnectionForm } from 'components'
import client from 'lib/axios'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import INTEGRATIONS from '../../../fixtures/integrations.json'
import * as navigate from 'utils/navigate'
import * as oauthCsrf from 'utils/oauthCsrf'

// The fixture token's redirectUri is on http://localhost:3000
const SAME_ORIGIN_URL = 'http://localhost:3000/apps/done'
const CROSS_ORIGIN_URL = 'https://evil.example/landing'

const mockAddToast = jest.fn()
let mockQuery: Record<string, string> = {}

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    route: '/',
    pathname: '',
    query: mockQuery,
    asPath: '',
    push: jest.fn()
  }))
}))

jest.mock('@apideck/components', () => ({
  ...jest.requireActual('@apideck/components'),
  useToast: () => ({ addToast: mockAddToast })
}))

const baseConnection = INTEGRATIONS.data.find((connector: any) => {
  return connector.id === 'lead+microsoft-dynamics'
}) as IConnection

const connection: IConnection = {
  ...baseConnection,
  state: 'added',
  oauth_grant_type: 'authorization_code',
  authorize_url: 'https://oauth.provider.com/authorize',
  form_fields: [
    {
      id: 'organisation_url',
      label: 'Organisation Url',
      value: 'example',
      placeholder: '',
      mask: false,
      type: 'text',
      required: true,
      description: '',
      disabled: false,
      options: [],
      custom_field: false,
      hidden: false
    }
  ]
}

const autoRedirectToken = (redirectUri = token.redirectUri): JWTSession => ({
  ...token,
  redirectUri,
  settings: { ...token.settings, autoRedirect: true }
})

const readyToastWithoutRedirect = {
  title: 'Connection is ready',
  type: 'success',
  autoClose: true
}

describe('ConnectionForm customer redirects', () => {
  const navigateSpy = jest.spyOn(navigate, 'navigateTo')
  const nonceSpy = jest.spyOn(oauthCsrf, 'generateAndStoreNonce')
  const patchSpy = jest.spyOn(client, 'patch')

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockQuery = {}
    navigateSpy.mockImplementation(() => undefined)
    nonceSpy.mockReturnValue('test-nonce')
    patchSpy.mockResolvedValue({ data: { data: { ...connection, state: 'callable' } } })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  afterAll(() => {
    navigateSpy.mockRestore()
    nonceSpy.mockRestore()
    patchSpy.mockRestore()
  })

  describe('return URL', () => {
    // Clicks Authorize and returns the redirect_uri that is sent to the authorize endpoint
    const authorizeRedirectUri = (): URL => {
      fireEvent.click(screen.getByRole('button', { name: 'Authorize' }))

      expect(navigateSpy).toHaveBeenCalledTimes(1)
      const authorizeUrl = new URL(navigateSpy.mock.calls[0][0])
      return new URL(authorizeUrl.searchParams.get('redirect_uri') as string)
    }

    it('adds a same-origin redirectAfterAuthUrl as redirectToAppUrl', () => {
      mockQuery = { redirectAfterAuthUrl: SAME_ORIGIN_URL }
      render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)

      expect(authorizeRedirectUri().searchParams.get('redirectToAppUrl')).toBe(SAME_ORIGIN_URL)
    })

    it('drops a cross-origin redirectAfterAuthUrl', () => {
      mockQuery = { redirectAfterAuthUrl: CROSS_ORIGIN_URL }
      render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)

      expect(authorizeRedirectUri().searchParams.has('redirectToAppUrl')).toBe(false)
    })

    it('adds token.redirectUri when autoRedirect is set', () => {
      render(<ConnectionForm connection={connection} jwt={jwt} token={autoRedirectToken()} />)

      expect(authorizeRedirectUri().searchParams.get('redirectToAppUrl')).toBe(token.redirectUri)
    })

    it('drops a javascript: token.redirectUri when autoRedirect is set', () => {
      render(
        <ConnectionForm
          connection={connection}
          jwt={jwt}
          token={autoRedirectToken('javascript:alert(document.domain)')}
        />
      )

      expect(authorizeRedirectUri().searchParams.has('redirectToAppUrl')).toBe(false)
    })
  })

  describe('post-save', () => {
    const saveAndWaitForToast = async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalled()
      })
      act(() => {
        jest.advanceTimersByTime(3000)
      })
    }

    it('redirects to a same-origin redirectToAppUrl after the save makes the connection callable', async () => {
      mockQuery = { redirectToAppUrl: SAME_ORIGIN_URL }
      render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)

      await saveAndWaitForToast()

      expect(navigateSpy).toHaveBeenCalledTimes(1)
      expect(navigateSpy).toHaveBeenCalledWith(
        `${SAME_ORIGIN_URL}?authorizedConnection=microsoft-dynamics`
      )
    })

    it('redirects to a same-origin redirectAfterAuthUrl when it is the only redirect value', async () => {
      mockQuery = { redirectAfterAuthUrl: SAME_ORIGIN_URL }
      render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)

      await saveAndWaitForToast()

      expect(navigateSpy).toHaveBeenCalledTimes(1)
      expect(navigateSpy).toHaveBeenCalledWith(
        `${SAME_ORIGIN_URL}?authorizedConnection=microsoft-dynamics`
      )
    })

    it('shows the ready toast without redirect for a cross-origin redirectToAppUrl', async () => {
      mockQuery = { redirectToAppUrl: CROSS_ORIGIN_URL }
      render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)

      await saveAndWaitForToast()

      expect(mockAddToast).toHaveBeenCalledWith(readyToastWithoutRedirect)
      expect(navigateSpy).not.toHaveBeenCalled()
    })

    it('does not fall back to token.redirectUri when redirectToAppUrl is rejected', async () => {
      mockQuery = { redirectToAppUrl: CROSS_ORIGIN_URL }
      render(<ConnectionForm connection={connection} jwt={jwt} token={autoRedirectToken()} />)

      await saveAndWaitForToast()

      expect(mockAddToast).toHaveBeenCalledWith(readyToastWithoutRedirect)
      expect(navigateSpy).not.toHaveBeenCalled()
    })

    it('redirects to token.redirectUri when only autoRedirect is set', async () => {
      render(<ConnectionForm connection={connection} jwt={jwt} token={autoRedirectToken()} />)

      await saveAndWaitForToast()

      expect(navigateSpy).toHaveBeenCalledTimes(1)
      expect(navigateSpy).toHaveBeenCalledWith(
        `${token.redirectUri}?authorizedConnection=microsoft-dynamics`
      )
    })
  })

  describe('isolation link', () => {
    it('renders Return to application for a same-origin redirectAfterAuthUrl', () => {
      mockQuery = { isolation: 'true', redirectAfterAuthUrl: SAME_ORIGIN_URL }
      render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)

      expect(screen.getByRole('link', { name: 'Return to application' }).getAttribute('href')).toBe(
        SAME_ORIGIN_URL
      )
    })

    it('renders no link for a cross-origin redirectAfterAuthUrl', () => {
      mockQuery = { isolation: 'true', redirectAfterAuthUrl: CROSS_ORIGIN_URL }
      render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)

      expect(screen.queryByRole('link', { name: 'Return to application' })).toBeNull()
    })

    it('renders no link for a javascript: redirectAfterAuthUrl', () => {
      mockQuery = { isolation: 'true', redirectAfterAuthUrl: 'javascript:alert(document.domain)' }
      render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)

      expect(screen.queryByRole('link', { name: 'Return to application' })).toBeNull()
    })
  })
})
