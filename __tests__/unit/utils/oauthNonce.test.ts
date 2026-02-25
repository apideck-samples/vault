import { generateNonce, storeNonce, retrieveAndClearNonce } from 'utils/oauthNonce'

describe('oauthNonce', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('generateNonce', () => {
    it('produces a valid UUID-like string', () => {
      const nonce = generateNonce()
      expect(nonce).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('produces unique values on successive calls', () => {
      const a = generateNonce()
      const b = generateNonce()
      expect(a).not.toBe(b)
    })

    it('fallback path produces valid UUID v4 when crypto.randomUUID is undefined', () => {
      const original = crypto.randomUUID
      ;(crypto as any).randomUUID = undefined

      try {
        const nonce = generateNonce()
        expect(nonce).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
        )
      } finally {
        crypto.randomUUID = original
      }
    })
  })

  describe('storeNonce', () => {
    it('stores nonce in sessionStorage with correct key', () => {
      storeNonce('salesforce', 'test-nonce-123')
      expect(sessionStorage.getItem('apideck_oauth_nonce_salesforce')).toBe('test-nonce-123')
    })
  })

  describe('retrieveAndClearNonce', () => {
    it('returns stored nonce and removes it from sessionStorage', () => {
      storeNonce('salesforce', 'test-nonce-456')

      const result = retrieveAndClearNonce('salesforce')

      expect(result).toBe('test-nonce-456')
      expect(sessionStorage.getItem('apideck_oauth_nonce_salesforce')).toBeNull()
    })

    it('returns null when no nonce stored', () => {
      const result = retrieveAndClearNonce('nonexistent')
      expect(result).toBeNull()
    })

    it('per-service key isolation: storing nonce for service A does not affect service B', () => {
      storeNonce('salesforce', 'nonce-sf')
      storeNonce('hubspot', 'nonce-hs')

      const sf = retrieveAndClearNonce('salesforce')
      expect(sf).toBe('nonce-sf')

      // hubspot nonce should still be there
      expect(sessionStorage.getItem('apideck_oauth_nonce_hubspot')).toBe('nonce-hs')
    })
  })
})
