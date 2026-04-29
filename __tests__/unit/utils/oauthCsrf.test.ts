import client from 'lib/axios'
import { generateAndStoreNonce, verifyAndClearNonce, callConfirmEndpoint } from 'utils/oauthCsrf'

jest.mock('lib/axios')

describe('oauthCsrf', () => {
  const mockRandomUUID = jest.fn()

  beforeAll(() => {
    Object.defineProperty(crypto, 'randomUUID', {
      value: mockRandomUUID,
      configurable: true
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorage.clear()
  })

  describe('generateAndStoreNonce', () => {
    it('generates a UUID and stores it in sessionStorage', () => {
      const mockUUID = '550e8400-e29b-41d4-a716-446655440000'
      mockRandomUUID.mockReturnValue(mockUUID)

      const nonce = generateAndStoreNonce('test-service')

      expect(nonce).toBe(mockUUID)
      expect(sessionStorage.getItem('apideck_oauth_nonce_test-service')).toBe(mockUUID)
    })

    it('uses the serviceId in the storage key', () => {
      mockRandomUUID.mockReturnValue('uuid-1')
      generateAndStoreNonce('salesforce')

      mockRandomUUID.mockReturnValue('uuid-2')
      generateAndStoreNonce('hubspot')

      expect(sessionStorage.getItem('apideck_oauth_nonce_salesforce')).toBe('uuid-1')
      expect(sessionStorage.getItem('apideck_oauth_nonce_hubspot')).toBe('uuid-2')
    })
  })

  describe('verifyAndClearNonce', () => {
    it('returns true when nonce matches stored value', () => {
      sessionStorage.setItem('apideck_oauth_nonce_test-service', 'my-nonce')

      const result = verifyAndClearNonce('test-service', 'my-nonce')

      expect(result).toBe(true)
    })

    it('returns false when nonce does not match', () => {
      sessionStorage.setItem('apideck_oauth_nonce_test-service', 'stored-nonce')

      const result = verifyAndClearNonce('test-service', 'wrong-nonce')

      expect(result).toBe(false)
    })

    it('returns false when no stored nonce exists', () => {
      const result = verifyAndClearNonce('test-service', 'any-nonce')

      expect(result).toBe(false)
    })

    it('clears the nonce from sessionStorage after verification', () => {
      sessionStorage.setItem('apideck_oauth_nonce_test-service', 'my-nonce')

      verifyAndClearNonce('test-service', 'my-nonce')

      expect(sessionStorage.getItem('apideck_oauth_nonce_test-service')).toBeNull()
    })

    it('clears the nonce even on mismatch', () => {
      sessionStorage.setItem('apideck_oauth_nonce_test-service', 'my-nonce')

      verifyAndClearNonce('test-service', 'wrong-nonce')

      expect(sessionStorage.getItem('apideck_oauth_nonce_test-service')).toBeNull()
    })
  })

  describe('callConfirmEndpoint', () => {
    const params = {
      serviceId: 'salesforce',
      unifiedApi: 'crm',
      confirmToken: 'confirm-tok-123',
      jwt: 'test-jwt',
      applicationId: 'app-id',
      consumerId: 'consumer-id'
    }

    it('calls the correct endpoint with auth headers and body', async () => {
      ;(client.post as jest.Mock).mockResolvedValue({
        data: { status_code: 200, status: 'OK', data: { confirmed: true } }
      })

      await callConfirmEndpoint(params)

      expect(client.post).toHaveBeenCalledWith(
        '/vault/connections/crm/salesforce/confirm',
        { confirm_token: 'confirm-tok-123' },
        {
          headers: {
            Authorization: 'Bearer test-jwt',
            'X-APIDECK-APP-ID': 'app-id',
            'X-APIDECK-CONSUMER-ID': 'consumer-id'
          }
        }
      )
    })

    it('returns the response data', async () => {
      const responseData = { status_code: 200, status: 'OK', data: { confirmed: true } }
      ;(client.post as jest.Mock).mockResolvedValue({ data: responseData })

      const result = await callConfirmEndpoint(params)

      expect(result).toEqual(responseData)
    })

    it('propagates errors from the API call', async () => {
      ;(client.post as jest.Mock).mockRejectedValue(new Error('Unauthorized'))

      await expect(callConfirmEndpoint(params)).rejects.toThrow('Unauthorized')
    })
  })
})
