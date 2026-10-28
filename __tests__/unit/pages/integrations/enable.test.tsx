import { render, waitFor } from '../../../testUtils/testing-utils'
import { jwt, token } from '../../../fixtures/session'

import client from 'lib/axios'

const mockPush = jest.fn()
const mockAddToast = jest.fn()
let mockQuery: Record<string, string> = {}

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: mockQuery,
    push: mockPush,
    pathname: '/integrations/[unified-api]/[provider]/enable',
    asPath: '/integrations/crm/salesforce/enable'
  }))
}))

jest.mock('utils/useSession', () => ({
  useSession: jest.fn(() => ({
    session: {
      jwt: 'test-jwt-token',
      applicationId: 'cfaZrORgaH2PMQpIcjTpfhERIpIEUJHev09ucjTp',
      consumerId: 'test-consumer-ckgrs95l3y4er0b99qa37buj2',
      redirectUri: 'https://app.example.com/vault'
    },
    setSession: jest.fn()
  }))
}))

jest.mock('@apideck/components', () => ({
  useToast: jest.fn(() => ({ addToast: mockAddToast }))
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

import EnableConnection from 'pages/integrations/[unified-api]/[provider]/enable'

describe('Enable Connection Page', () => {
  const renderAndReadPushedPath = async (redirectAfterAuthUrl?: string): Promise<URL> => {
    mockQuery = {
      'unified-api': 'crm',
      provider: 'salesforce',
      ...(redirectAfterAuthUrl ? { redirectAfterAuthUrl } : {})
    }
    render(<EnableConnection jwt={jwt} token={token} />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledTimes(1)
    })
    return new URL(mockPush.mock.calls[0][0], 'http://localhost')
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(client.patch as jest.Mock).mockResolvedValue({ data: { data: { name: 'Salesforce' } } })
  })

  it('forwards an allowed redirectAfterAuthUrl URL-encoded', async () => {
    const redirectAfterAuthUrl = 'https://app.example.com/done?step=2&tab=crm#section'

    const pushed = await renderAndReadPushedPath(redirectAfterAuthUrl)

    expect(pushed.pathname).toBe('/integrations/crm/salesforce')
    expect(pushed.searchParams.get('isolation')).toBe('true')
    expect(pushed.searchParams.get('redirectAfterAuthUrl')).toBe(redirectAfterAuthUrl)
    expect(pushed.searchParams.has('tab')).toBe(false)
    expect(pushed.hash).toBe('')
  })

  it('drops a cross-origin redirectAfterAuthUrl', async () => {
    const pushed = await renderAndReadPushedPath('https://evil.example/landing')

    expect(pushed.pathname).toBe('/integrations/crm/salesforce')
    expect(pushed.searchParams.get('isolation')).toBe('true')
    expect(pushed.searchParams.has('redirectAfterAuthUrl')).toBe(false)
  })

  it('pushes ?isolation=true only when there is no redirectAfterAuthUrl', async () => {
    await renderAndReadPushedPath()

    expect(mockPush).toHaveBeenCalledWith('/integrations/crm/salesforce?isolation=true')
  })
})
