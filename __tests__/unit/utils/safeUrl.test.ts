import {
  allowedAppUrl,
  docsUrl,
  parseHttpUrl,
  returnToAppHref,
  targetOrigin,
  withAuthorizedConnection
} from 'utils/safeUrl'

const SESSION_REDIRECT_URI = 'https://app.example.com/vault'

describe('safeUrl', () => {
  describe('parseHttpUrl', () => {
    it('accepts an https URL', () => {
      expect(parseHttpUrl('https://app.example.com/vault?x=1')?.href).toBe(
        'https://app.example.com/vault?x=1'
      )
    })

    it('accepts an http localhost URL', () => {
      expect(parseHttpUrl('http://localhost:3000/vault')?.href).toBe('http://localhost:3000/vault')
    })

    it('rejects javascript:', () => {
      expect(parseHttpUrl('javascript:alert(1)')).toBeNull()
      expect(parseHttpUrl('JavaScript:alert(1)')).toBeNull()
    })

    it('rejects data:', () => {
      expect(parseHttpUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
    })

    it('rejects a relative path', () => {
      expect(parseHttpUrl('/integrations/crm/salesforce')).toBeNull()
    })

    it('rejects a protocol-relative URL', () => {
      expect(parseHttpUrl('//evil.example/landing')).toBeNull()
    })

    it('rejects an unparseable string', () => {
      expect(parseHttpUrl('not a url')).toBeNull()
      expect(parseHttpUrl('https://')).toBeNull()
    })

    it('rejects a URL with username or password', () => {
      expect(parseHttpUrl('https://user:pass@app.example.com/vault')).toBeNull()
      expect(parseHttpUrl('https://user@app.example.com/vault')).toBeNull()
      expect(parseHttpUrl('https://:pass@app.example.com/vault')).toBeNull()
    })

    it('rejects an empty string', () => {
      expect(parseHttpUrl('')).toBeNull()
    })

    it('rejects non-strings (undefined, array, number)', () => {
      expect(parseHttpUrl(undefined)).toBeNull()
      expect(parseHttpUrl(null)).toBeNull()
      expect(parseHttpUrl(['https://app.example.com/vault'])).toBeNull()
      expect(parseHttpUrl(42)).toBeNull()
    })
  })

  describe('allowedAppUrl', () => {
    it('allows the same origin with another path and query', () => {
      expect(
        allowedAppUrl('https://app.example.com/settings?tab=integrations', SESSION_REDIRECT_URI)
          ?.href
      ).toBe('https://app.example.com/settings?tab=integrations')
    })

    it('treats an explicit default port as the same origin', () => {
      expect(allowedAppUrl('https://app.example.com:443/done', SESSION_REDIRECT_URI)?.href).toBe(
        'https://app.example.com/done'
      )
    })

    it('rejects another host', () => {
      expect(allowedAppUrl('https://evil.example/landing', SESSION_REDIRECT_URI)).toBeNull()
    })

    it('rejects a host that only starts with the session host (app.example.com.evil.com)', () => {
      expect(
        allowedAppUrl('https://app.example.com.evil.com/done', SESSION_REDIRECT_URI)
      ).toBeNull()
    })

    it('rejects another scheme', () => {
      expect(allowedAppUrl('http://app.example.com/done', SESSION_REDIRECT_URI)).toBeNull()
    })

    it('rejects another port', () => {
      expect(allowedAppUrl('https://app.example.com:8443/done', SESSION_REDIRECT_URI)).toBeNull()
    })

    it('rejects when the session redirectUri is absent', () => {
      expect(allowedAppUrl('https://app.example.com/done', undefined)).toBeNull()
      expect(allowedAppUrl('https://app.example.com/done', null)).toBeNull()
      expect(allowedAppUrl('https://app.example.com/done', '')).toBeNull()
    })

    it('rejects when the session redirectUri is javascript: or unparseable', () => {
      expect(allowedAppUrl('https://app.example.com/done', 'javascript:alert(1)')).toBeNull()
      expect(allowedAppUrl('javascript:alert(1)', 'javascript:alert(2)')).toBeNull()
      expect(allowedAppUrl('https://app.example.com/done', 'not a url')).toBeNull()
    })

    it('rejects a same-host candidate with credentials', () => {
      expect(
        allowedAppUrl('https://user:pass@app.example.com/done', SESSION_REDIRECT_URI)
      ).toBeNull()
    })

    it('returns a new URL each call', () => {
      const first = allowedAppUrl('https://app.example.com/done', SESSION_REDIRECT_URI)
      const second = allowedAppUrl('https://app.example.com/done', SESSION_REDIRECT_URI)

      expect(first).toBeInstanceOf(URL)
      expect(second).toBeInstanceOf(URL)
      expect(first).not.toBe(second)

      first?.searchParams.append('authorizedConnection', 'salesforce')
      expect(second?.href).toBe('https://app.example.com/done')
    })
  })

  describe('returnToAppHref', () => {
    it('returns https://app.apideck.com when redirectUri is undefined, null or empty', () => {
      expect(returnToAppHref(undefined)).toBe('https://app.apideck.com')
      expect(returnToAppHref(null)).toBe('https://app.apideck.com')
      expect(returnToAppHref('')).toBe('https://app.apideck.com')
    })

    it('returns an http(s) redirectUri', () => {
      expect(returnToAppHref('https://app.example.com/vault')).toBe('https://app.example.com/vault')
      expect(returnToAppHref('http://localhost:3000/vault')).toBe('http://localhost:3000/vault')
    })

    it('returns null for javascript:', () => {
      expect(returnToAppHref('javascript:alert(1)')).toBeNull()
    })

    it('returns null for an unparseable redirectUri', () => {
      expect(returnToAppHref('not a url')).toBeNull()
    })
  })

  describe('docsUrl', () => {
    it("allows unify's ref https://developers.apideck.com/errors#oauthinvalidstateerror", () => {
      expect(docsUrl('https://developers.apideck.com/errors#oauthinvalidstateerror')).toBe(
        'https://developers.apideck.com/errors#oauthinvalidstateerror'
      )
    })

    it('rejects http://developers.apideck.com', () => {
      expect(docsUrl('http://developers.apideck.com/errors#oauthinvalidstateerror')).toBeNull()
    })

    it('rejects another host', () => {
      expect(docsUrl('https://evil.example/errors')).toBeNull()
    })

    it('rejects developers.apideck.com.evil.com', () => {
      expect(docsUrl('https://developers.apideck.com.evil.com/errors')).toBeNull()
    })

    it('rejects javascript:', () => {
      expect(docsUrl('javascript:alert(1)')).toBeNull()
    })

    it('rejects credentials', () => {
      expect(docsUrl('https://user:pass@developers.apideck.com/errors')).toBeNull()
    })

    it('rejects missing', () => {
      expect(docsUrl(undefined)).toBeNull()
      expect(docsUrl('')).toBeNull()
    })
  })

  describe('targetOrigin', () => {
    it('returns an https origin', () => {
      expect(targetOrigin('https://app.example.com')).toBe('https://app.example.com')
    })

    it('strips a trailing slash', () => {
      expect(targetOrigin('https://app.example.com/')).toBe('https://app.example.com')
    })

    it('accepts http://localhost:3000', () => {
      expect(targetOrigin('http://localhost:3000')).toBe('http://localhost:3000')
    })

    it('rejects a path', () => {
      expect(targetOrigin('https://app.example.com/vault')).toBeNull()
    })

    it('rejects a query', () => {
      expect(targetOrigin('https://app.example.com/?x=1')).toBeNull()
    })

    it('rejects a fragment', () => {
      expect(targetOrigin('https://app.example.com/#x')).toBeNull()
    })

    it("rejects '*'", () => {
      expect(targetOrigin('*')).toBeNull()
    })

    it("rejects 'null'", () => {
      expect(targetOrigin('null')).toBeNull()
    })

    it('rejects javascript:', () => {
      expect(targetOrigin('javascript:alert(1)')).toBeNull()
    })

    it('rejects credentials', () => {
      expect(targetOrigin('https://user:pass@app.example.com')).toBeNull()
    })

    it('rejects empty and missing', () => {
      expect(targetOrigin('')).toBeNull()
      expect(targetOrigin(undefined)).toBeNull()
    })
  })

  describe('withAuthorizedConnection', () => {
    it('appends authorizedConnection and keeps the existing query', () => {
      expect(
        withAuthorizedConnection(new URL('https://app.example.com/done?tab=crm'), 'salesforce')
      ).toBe('https://app.example.com/done?tab=crm&authorizedConnection=salesforce')
    })

    it('does not modify the URL it is given', () => {
      const url = new URL('https://app.example.com/done?tab=crm')

      withAuthorizedConnection(url, 'salesforce')

      expect(url.href).toBe('https://app.example.com/done?tab=crm')
    })
  })
})
