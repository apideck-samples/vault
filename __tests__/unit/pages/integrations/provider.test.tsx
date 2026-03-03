import { render, waitFor } from '../../../testUtils/testing-utils'
import * as oauthCsrf from 'utils/oauthCsrf'

const mockMutate = jest.fn()
const mockReplace = jest.fn()
const mockAddToast = jest.fn()
const mockSetSession = jest.fn()

let mockQuery: Record<string, string> = {}

const mockSession = {
  applicationId: 'cfaZrORgaH2PMQpIcjTpfhERIpIEUJHev09ucjTp',
  consumerId: 'test-consumer-ckgrs95l3y4er0b99qa37buj2',
  jwt: 'test-jwt-token'
}

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: mockQuery,
    replace: mockReplace,
    pathname: '/integrations/[unified-api]/[provider]',
    push: jest.fn()
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

import Connection from 'pages/integrations/[unified-api]/[provider]'
import { jwt, token } from '../../../fixtures/session'

describe('Connection Detail Page - Confirm Flow', () => {
  const verifyNonceSpy = jest.spyOn(oauthCsrf, 'verifyAndClearNonce')
  const callConfirmSpy = jest.spyOn(oauthCsrf, 'callConfirmEndpoint')

  beforeEach(() => {
    jest.clearAllMocks()
    mockQuery = {}
    verifyNonceSpy.mockReturnValue(true)
    callConfirmSpy.mockResolvedValue({
      status_code: 200,
      status: 'OK',
      data: { confirmed: true }
    })
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
      mockQuery = {
        nonce: 'test-nonce',
        confirm_token: 'test-confirm-token',
        service_id: 'salesforce',
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
        expect(mockReplace).toHaveBeenCalledWith(
          '/integrations/crm/salesforce',
          undefined,
          { shallow: true }
        )
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
      mockQuery = {
        nonce: 'wrong-nonce',
        confirm_token: 'test-confirm-token',
        service_id: 'salesforce',
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
      mockQuery = {
        nonce: 'test-nonce',
        confirm_token: 'test-confirm-token',
        service_id: 'salesforce',
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
