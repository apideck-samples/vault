import { act, render, waitFor } from '../../../testUtils/testing-utils'
import * as oauthCsrf from 'utils/oauthCsrf'
import * as navigate from 'utils/navigate'
import client from 'lib/axios'
import { JWTSession } from 'types/JWTSession'
import { unsignedJwt } from '../../../testUtils/unsignedJwt'

const mockMutate = jest.fn()
const mockReplace = jest.fn()
const mockAddToast = jest.fn()
const mockSetSession = jest.fn()

let mockQuery: Record<string, string> = {}

let mockSession: Record<string, unknown> = {
  applicationId: 'cfaZrORgaH2PMQpIcjTpfhERIpIEUJHev09ucjTp',
  consumerId: 'test-consumer-ckgrs95l3y4er0b99qa37buj2',
  jwt: 'test-jwt-token'
}

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: mockQuery,
    replace: mockReplace,
    pathname: '/integrations/[unified-api]/[provider]',
    push: jest.fn(),
    asPath: '/integrations/crm/salesforce'
  }))
}))

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      data: {
        data: {
          id: 'crm+salesforce',
          service_id: 'salesforce',
          unified_api: 'crm',
          name: 'Salesforce',
          state: 'callable',
          auth_type: 'oauth2',
          enabled: true,
          icon: 'https://example.com/icon.png',
          form_fields: [],
          configurable_resources: [],
          resource_schema_support: [],
          settings: [],
          custom_mappings: []
        }
      }
    },
    error: null,
    mutate: mockMutate
  }))
}))

jest.mock('utils/useSession', () => ({
  useSession: jest.fn(() => ({
    session: mockSession,
    setSession: mockSetSession
  }))
}))

jest.mock('@apideck/components', () => ({
  useToast: jest.fn(() => ({ addToast: mockAddToast })),
  Button: ({ text, ...props }: any) => <button {...props}>{text}</button>,
  TextInput: (props: any) => <input {...props} />,
  Toggle: (props: any) => <input type="checkbox" {...props} />,
  TextArea: (props: any) => <textarea {...props} />
}))

jest.mock('lib/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    create: jest.fn()
  }
}))

jest.mock('utils/consent', () => ({
  hasApplicableScopes: jest.fn(() => false),
  requiresConsent: jest.fn(() => false)
}))

import Connection, { getServerSideProps } from 'pages/integrations/[unified-api]/[provider]'
import { jwt, token } from '../../../fixtures/session'

describe('Connection Detail Page - Confirm Flow', () => {
  const verifyNonceSpy = jest.spyOn(oauthCsrf, 'verifyAndClearNonce')
  const callConfirmSpy = jest.spyOn(oauthCsrf, 'callConfirmEndpoint')

  beforeEach(() => {
    jest.clearAllMocks()
    mockQuery = {}
    window.location.hash = ''
    verifyNonceSpy.mockReturnValue(true)
    callConfirmSpy.mockResolvedValue({
      status_code: 200,
      status: 'OK',
      data: { confirmed: true }
    })
  })

  afterEach(() => {
    window.location.hash = ''
  })

  const defaultProps = {
    jwt,
    token,
    unifiedApi: 'crm',
    provider: 'salesforce',
    connections: [],
    setConnections: jest.fn(),
    loading: false
  }

  describe('when confirm params are present and nonce matches', () => {
    beforeEach(() => {
      window.location.hash =
        '#nonce=test-nonce&confirm_token=test-confirm-token&service_id=salesforce'
      mockQuery = {
        'unified-api': 'crm',
        provider: 'salesforce'
      }
    })

    it('calls verifyAndClearNonce with the service_id and nonce', async () => {
      render(<Connection {...defaultProps} />)

      await waitFor(() => {
        expect(verifyNonceSpy).toHaveBeenCalledWith('salesforce', 'test-nonce')
      })
    })

    it('calls callConfirmEndpoint with correct params', async () => {
      render(<Connection {...defaultProps} />)

      await waitFor(() => {
        expect(callConfirmSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            serviceId: 'salesforce',
            unifiedApi: 'crm',
            confirmToken: 'test-confirm-token'
          })
        )
      })
    })

    it('cleans up the URL after successful confirm', async () => {
      render(<Connection {...defaultProps} />)

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/integrations/crm/salesforce', undefined, {
          shallow: true
        })
      })
    })

    it('triggers SWR mutate after successful confirm', async () => {
      render(<Connection {...defaultProps} />)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })
    })
  })

  describe('when confirm params are present but nonce does not match', () => {
    beforeEach(() => {
      window.location.hash =
        '#nonce=wrong-nonce&confirm_token=test-confirm-token&service_id=salesforce'
      mockQuery = {
        'unified-api': 'crm',
        provider: 'salesforce'
      }
      verifyNonceSpy.mockReturnValue(false)
    })

    it('does NOT call callConfirmEndpoint', async () => {
      render(<Connection {...defaultProps} />)

      await waitFor(() => {
        expect(verifyNonceSpy).toHaveBeenCalled()
      })

      expect(callConfirmSpy).not.toHaveBeenCalled()
    })

    it('shows an error toast', async () => {
      render(<Connection {...defaultProps} />)

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error'
          })
        )
      })
    })
  })

  describe('when no confirm params are present', () => {
    beforeEach(() => {
      window.location.hash = ''
      mockQuery = {
        'unified-api': 'crm',
        provider: 'salesforce'
      }
    })

    it('does not call verifyAndClearNonce', () => {
      render(<Connection {...defaultProps} />)

      expect(verifyNonceSpy).not.toHaveBeenCalled()
    })

    it('does not call callConfirmEndpoint', () => {
      render(<Connection {...defaultProps} />)

      expect(callConfirmSpy).not.toHaveBeenCalled()
    })
  })

  describe('when confirm endpoint fails', () => {
    beforeEach(() => {
      window.location.hash =
        '#nonce=test-nonce&confirm_token=test-confirm-token&service_id=salesforce'
      mockQuery = {
        'unified-api': 'crm',
        provider: 'salesforce'
      }
      callConfirmSpy.mockRejectedValue(new Error('Confirm failed'))
    })

    it('shows an error toast', async () => {
      render(<Connection {...defaultProps} />)

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error'
          })
        )
      })
    })
  })
})

describe('redirectToAppUrl (client)', () => {
  // The fixture token's redirectUri is on http://localhost:3000; the mocked session has none
  const navigateSpy = jest.spyOn(navigate, 'navigateTo')
  const baseSession = mockSession

  const defaultProps = {
    jwt,
    token,
    unifiedApi: 'crm',
    provider: 'salesforce',
    connections: [],
    setConnections: jest.fn(),
    loading: false
  }

  const renderWithRedirect = (redirectToAppUrl: string, props = defaultProps) => {
    mockQuery = { 'unified-api': 'crm', provider: 'salesforce', redirectToAppUrl }
    render(<Connection {...props} />)
  }

  const advancePastRedirectDelay = () => {
    act(() => {
      jest.advanceTimersByTime(3000)
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    window.location.hash = ''
    navigateSpy.mockImplementation(() => undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
    mockSession = baseSession
  })

  afterAll(() => {
    navigateSpy.mockRestore()
  })

  it('redirects to a same-origin redirectToAppUrl with authorizedConnection after 3 s', () => {
    renderWithRedirect('http://localhost:3000/apps/done?step=2')

    expect(navigateSpy).not.toHaveBeenCalled()
    advancePastRedirectDelay()

    expect(navigateSpy).toHaveBeenCalledTimes(1)
    expect(navigateSpy).toHaveBeenCalledWith(
      'http://localhost:3000/apps/done?step=2&authorizedConnection=salesforce'
    )
  })

  it('shows the redirect toast for an allowed target', () => {
    renderWithRedirect('http://localhost:3000/apps/done')

    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Connection is ready',
        description: 'You will now get redirected back to the application.'
      })
    )
  })

  it('does not redirect to a cross-origin redirectToAppUrl but shows the ready toast without the redirect description', () => {
    renderWithRedirect('https://evil.example/landing')
    advancePastRedirectDelay()

    expect(navigateSpy).not.toHaveBeenCalled()
    expect(mockAddToast).toHaveBeenCalledWith({
      title: 'Connection is ready',
      type: 'success',
      autoClose: true
    })
  })

  it('does not redirect to a javascript: redirectToAppUrl', () => {
    renderWithRedirect('javascript:alert(document.domain)')
    advancePastRedirectDelay()

    expect(navigateSpy).not.toHaveBeenCalled()
    expect(mockAddToast).toHaveBeenCalledWith({
      title: 'Connection is ready',
      type: 'success',
      autoClose: true
    })
  })

  it('does not throw on an unparseable redirectToAppUrl', () => {
    renderWithRedirect('not a url')

    expect(advancePastRedirectDelay).not.toThrow()
    expect(navigateSpy).not.toHaveBeenCalled()
    expect(mockAddToast).toHaveBeenCalledWith({
      title: 'Connection is ready',
      type: 'success',
      autoClose: true
    })
  })

  it('uses the session redirectUri when the page has no token', () => {
    mockSession = { ...baseSession, redirectUri: 'https://app.example.com/vault' }

    renderWithRedirect('https://app.example.com/apps/done', {
      ...defaultProps,
      token: (null as unknown) as JWTSession
    })
    advancePastRedirectDelay()

    expect(navigateSpy).toHaveBeenCalledWith(
      'https://app.example.com/apps/done?authorizedConnection=salesforce'
    )
  })
})

describe('getServerSideProps', () => {
  const callableConnection = { service_id: 'salesforce', unified_api: 'crm', state: 'callable' }

  const buildContext = (query: Record<string, string>) => ({
    res: { writeHead: jest.fn(), end: jest.fn() },
    query: { 'unified-api': 'crm', provider: 'salesforce', ...query }
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(client.get as jest.Mock).mockResolvedValue({ data: { data: callableConnection } })
  })

  it('answers 301 with authorizedConnection for a same-origin redirectToAppUrl', async () => {
    const context = buildContext({ jwt, redirectToAppUrl: 'http://localhost:3000/apps/done' })

    await getServerSideProps(context)

    expect(client.get).toHaveBeenCalledWith('/vault/connections/crm/salesforce', expect.anything())
    expect(context.res.writeHead).toHaveBeenCalledWith(301, {
      Location: 'http://localhost:3000/apps/done?authorizedConnection=salesforce'
    })
    expect(context.res.end).toHaveBeenCalled()
  })

  it('does not fetch or redirect for a cross-origin redirectToAppUrl', async () => {
    const context = buildContext({ jwt, redirectToAppUrl: 'https://evil.example/landing' })

    await getServerSideProps(context)

    expect(client.get).not.toHaveBeenCalled()
    expect(context.res.writeHead).not.toHaveBeenCalled()
    expect(context.res.end).not.toHaveBeenCalled()
  })

  it('does not redirect for a javascript: redirectToAppUrl', async () => {
    const context = buildContext({ jwt, redirectToAppUrl: 'javascript:alert(document.domain)' })

    await getServerSideProps(context)

    expect(client.get).not.toHaveBeenCalled()
    expect(context.res.writeHead).not.toHaveBeenCalled()
  })

  it('returns props instead of throwing for an unparseable redirectToAppUrl', async () => {
    const context = buildContext({ jwt, redirectToAppUrl: 'not a url' })

    const result = await getServerSideProps(context)

    expect(result.props).toEqual(
      expect.objectContaining({ jwt, unifiedApi: 'crm', provider: 'salesforce' })
    )
    expect(context.res.writeHead).not.toHaveBeenCalled()
  })

  it('does not redirect when the token has no redirectUri', async () => {
    const context = buildContext({
      jwt: unsignedJwt({
        application_id: 'cfaZrORgaH2PMQpIcjTpfhERIpIEUJHev09ucjTp',
        consumer_id: 'test-consumer-ckgrs95l3y4er0b99qa37buj2'
      }),
      redirectToAppUrl: 'http://localhost:3000/apps/done'
    })

    await getServerSideProps(context)

    expect(client.get).not.toHaveBeenCalled()
    expect(context.res.writeHead).not.toHaveBeenCalled()
  })

  it('no longer returns redirectAfterAuthUrl in props', async () => {
    const context = buildContext({
      jwt,
      redirectAfterAuthUrl: 'http://localhost:3000/apps/done'
    })

    const result = await getServerSideProps(context)

    expect(result.props).not.toHaveProperty('redirectAfterAuthUrl')
  })
})
