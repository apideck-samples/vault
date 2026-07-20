import client from 'lib/axios'
import {
  storeGrant,
  readAndClearGrant,
  probeSessionStorage,
  confirmWithGrant
} from 'utils/oauthGrantHandoff'

jest.mock('lib/axios')

describe('oauthGrantHandoff', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    sessionStorage.clear()
  })

  describe('storeGrant', () => {
    it('stores the grant in sessionStorage under apideck_oauth_grant_{serviceId}', () => {
      storeGrant('test-service', 'grant-abc')

      expect(sessionStorage.getItem('apideck_oauth_grant_test-service')).toBe('grant-abc')
    })

    it('uses the serviceId in the storage key', () => {
      storeGrant('salesforce', 'grant-1')
      storeGrant('hubspot', 'grant-2')

      expect(sessionStorage.getItem('apideck_oauth_grant_salesforce')).toBe('grant-1')
      expect(sessionStorage.getItem('apideck_oauth_grant_hubspot')).toBe('grant-2')
    })
  })

  describe('readAndClearGrant', () => {
    it('returns the stored grant for the serviceId', () => {
      sessionStorage.setItem('apideck_oauth_grant_test-service', 'grant-abc')

      expect(readAndClearGrant('test-service')).toBe('grant-abc')
    })

    it('removes the grant from sessionStorage after reading', () => {
      sessionStorage.setItem('apideck_oauth_grant_test-service', 'grant-abc')

      readAndClearGrant('test-service')

      expect(sessionStorage.getItem('apideck_oauth_grant_test-service')).toBeNull()
    })

    it('returns null when no grant is stored for the serviceId', () => {
      expect(readAndClearGrant('test-service')).toBeNull()
    })
  })

  describe('probeSessionStorage', () => {
    it('returns true when a write-read-remove round-trip succeeds', () => {
      expect(probeSessionStorage()).toBe(true)
    })

    it('returns false when sessionStorage.setItem throws', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('storage disabled')
      })

      expect(probeSessionStorage()).toBe(false)
    })

    it('leaves no probe key behind on success', () => {
      probeSessionStorage()

      expect(sessionStorage.length).toBe(0)
    })
  })

  describe('confirmWithGrant', () => {
    const params = {
      unifiedApi: 'crm',
      serviceId: 'salesforce',
      confirmToken: 'confirm-tok-123',
      grant: 'grant-abc'
    }

    it('POSTs { confirm_token, grant } to /vault/connections/{unifiedApi}/{serviceId}/confirm with no auth headers', async () => {
      ;(client.post as jest.Mock).mockResolvedValue({
        data: { status_code: 200, status: 'OK', data: { confirmed: true } }
      })

      await confirmWithGrant(params)

      expect(client.post).toHaveBeenCalledWith('/vault/connections/crm/salesforce/confirm', {
        confirm_token: 'confirm-tok-123',
        grant: 'grant-abc'
      })

      // No auth headers: the grant is the auth. Assert no third (config) argument
      // carrying Authorization / X-APIDECK-* headers was passed.
      const call = (client.post as jest.Mock).mock.calls[0]
      expect(call[2]).toBeUndefined()
    })

    it('returns the response data on success', async () => {
      const responseData = { status_code: 200, status: 'OK', data: { confirmed: true } }
      ;(client.post as jest.Mock).mockResolvedValue({ data: responseData })

      const result = await confirmWithGrant(params)

      expect(result).toEqual(responseData)
    })

    it('propagates errors from the API call', async () => {
      ;(client.post as jest.Mock).mockRejectedValue(new Error('grant expired'))

      await expect(confirmWithGrant(params)).rejects.toThrow('grant expired')
    })
  })
})
