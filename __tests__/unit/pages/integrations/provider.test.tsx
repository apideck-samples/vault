import React from 'react'
import { render, waitFor } from '../../../testUtils/testing-utils'
import * as oauthNonce from 'utils/oauthNonce'
import client from 'lib/axios'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    route: '/integrations/[unified-api]/[provider]',
    pathname: '/integrations/[unified-api]/[provider]',
    query: {},
    asPath: '/integrations/crm/salesforce',
    replace: jest.fn(),
    push: jest.fn()
  })
}))

// Mock SWR - use global ref to avoid hoisting issues
const mockMutate = jest.fn()
const mockSwrDefault = jest.fn().mockReturnValue({ data: null, error: null })
jest.mock('swr', () => {
  return {
    __esModule: true,
    default: (...args: any[]) => mockSwrDefault(...args),
    mutate: (...args: any[]) => mockMutate(...args)
  }
})

// Mock useSession
jest.mock('utils/useSession', () => ({
  useSession: jest.fn().mockReturnValue({
    session: {
      jwt: 'test-jwt',
      applicationId: 'test-app',
      consumerId: 'test-consumer'
    },
    setSession: jest.fn()
  })
}))

// Mock useToast
const mockAddToast = jest.fn()
jest.mock('@apideck/components', () => {
  const actual = jest.requireActual('@apideck/components')
  return {
    ...actual,
    useToast: () => ({ addToast: mockAddToast })
  }
})

// Mock axios
jest.mock('lib/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
  }
}))

// Import the component (static import, no dynamic import inside tests)
import Connection from 'pages/integrations/[unified-api]/[provider]'

describe('Provider page - OAuth fragment handling', () => {
  let originalLocation: Location
  let replaceStateSpy: jest.SpyInstance

  beforeEach(() => {
    originalLocation = window.location
    replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {})
    jest.clearAllMocks()
    sessionStorage.clear()
  })

  afterEach(() => {
    if (window.location !== originalLocation) {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true
      })
    }
    replaceStateSpy.mockRestore()
  })

  const setHash = (hash: string) => {
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        hash,
        href: `https://vault.apideck.com/integrations/crm/salesforce${hash}`,
        origin: 'https://vault.apideck.com'
      },
      writable: true,
      configurable: true
    })
  }

  const defaultProps = {
    jwt: 'test-jwt',
    token: {
      applicationId: 'test-app',
      consumerId: 'test-consumer'
    } as any,
    unifiedApi: 'crm',
    provider: 'salesforce',
    connections: [],
    setConnections: jest.fn(),
    loading: false
  }

  it('extracts nonce, confirm_token, service_id from hash and calls confirm', async () => {
    setHash('#nonce=test-nonce&confirm_token=test-token&service_id=salesforce')
    jest.spyOn(oauthNonce, 'retrieveAndClearNonce').mockReturnValue('test-nonce')
    ;(client.post as jest.Mock).mockResolvedValue({ data: { data: {} } })

    render(<Connection {...defaultProps} />)

    await waitFor(() => {
      expect(client.post).toHaveBeenCalledWith(
        '/vault/connections/crm/salesforce/confirm',
        { confirm_token: 'test-token' },
        {
          headers: {
            Authorization: 'Bearer test-jwt',
            'X-APIDECK-APP-ID': 'test-app',
            'X-APIDECK-CONSUMER-ID': 'test-consumer'
          }
        }
      )
    })
  })

  it('does nothing when hash is empty (normal page load)', async () => {
    setHash('')

    render(<Connection {...defaultProps} />)

    // Give time for effects to run
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(client.post).not.toHaveBeenCalledWith(
      expect.stringContaining('/confirm'),
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('shows toast error on mismatched nonce', async () => {
    setHash('#nonce=wrong-nonce&confirm_token=test-token&service_id=salesforce')
    jest.spyOn(oauthNonce, 'retrieveAndClearNonce').mockReturnValue('correct-nonce')

    render(<Connection {...defaultProps} />)

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'Authorization could not be verified. Please try again.',
        type: 'error'
      })
    })

    expect(client.post).not.toHaveBeenCalledWith(
      expect.stringContaining('/confirm'),
      expect.any(Object),
      expect.any(Object)
    )
  })

  it('cleans up URL fragment via history.replaceState after matching nonce', async () => {
    setHash('#nonce=good-nonce&confirm_token=good-token&service_id=salesforce')
    jest.spyOn(oauthNonce, 'retrieveAndClearNonce').mockReturnValue('good-nonce')
    ;(client.post as jest.Mock).mockResolvedValue({ data: { data: {} } })

    render(<Connection {...defaultProps} />)

    await waitFor(() => {
      expect(replaceStateSpy).toHaveBeenCalledWith(
        null,
        '',
        'https://vault.apideck.com/integrations/crm/salesforce'
      )
    })
  })

  it('shows toast error when confirm API call fails', async () => {
    setHash('#nonce=fail-nonce&confirm_token=fail-token&service_id=salesforce')
    jest.spyOn(oauthNonce, 'retrieveAndClearNonce').mockReturnValue('fail-nonce')
    ;(client.post as jest.Mock).mockRejectedValue(new Error('Server error'))

    render(<Connection {...defaultProps} />)

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: 'Authorization confirmation failed. Please try again.',
        type: 'error'
      })
    })
  })

  it('triggers SWR mutate after successful confirm', async () => {
    setHash('#nonce=ok-nonce&confirm_token=ok-token&service_id=salesforce')
    jest.spyOn(oauthNonce, 'retrieveAndClearNonce').mockReturnValue('ok-nonce')
    ;(client.post as jest.Mock).mockResolvedValue({ data: { data: {} } })

    render(<Connection {...defaultProps} />)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith('/vault/connections/crm/salesforce')
      expect(mockMutate).toHaveBeenCalledWith('/vault/connections')
    })
  })
})
