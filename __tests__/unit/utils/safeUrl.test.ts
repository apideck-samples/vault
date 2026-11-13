import {
  docsUrl,
  parseHttpUrl,
  parseReturnUrl,
  returnToAppHref,
  targetOrigin,
  withAuthorizedConnection
} from 'utils/safeUrl'

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

  describe('parseHttpUrl and app deep links', () => {
    it('rejects a custom scheme', () => {
      expect(parseHttpUrl('myapp://vault/done')).toBeNull()
    })
  })

  describe('parseReturnUrl', () => {
    it('accepts an https URL on any origin', () => {
      expect(parseReturnUrl('https://other.example.com/done')?.href).toBe(
        'https://other.example.com/done'
      )
    })

    it('accepts an app deep link', () => {
      expect(parseReturnUrl('myapp://vault/done')?.href).toBe('myapp://vault/done')
      expect(parseReturnUrl('com.acme.app:/oauth/done')?.href).toBe('com.acme.app:/oauth/done')
    })

    it('rejects javascript:, data: and vbscript: in any case', () => {
      expect(parseReturnUrl('javascript:alert(1)')).toBeNull()
      expect(parseReturnUrl('JavaScript:alert(1)')).toBeNull()
      expect(parseReturnUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
      expect(parseReturnUrl('vbscript:msgbox(1)')).toBeNull()
    })

    it('rejects javascript: hidden by a tab, newline or leading space', () => {
      expect(parseReturnUrl('java\tscript:alert(1)')).toBeNull()
      expect(parseReturnUrl('java\nscript:alert(1)')).toBeNull()
      expect(parseReturnUrl(' javascript:alert(1)')).toBeNull()
    })

    it('rejects a URL with username or password', () => {
      expect(parseReturnUrl('https://user:pass@app.example.com/done')).toBeNull()
      expect(parseReturnUrl('myapp://user@vault/done')).toBeNull()
    })

    it('rejects relative, unparseable, empty and non-string values', () => {
      expect(parseReturnUrl('/integrations/crm/salesforce')).toBeNull()
      expect(parseReturnUrl('//evil.example/landing')).toBeNull()
      expect(parseReturnUrl('not a url')).toBeNull()
      expect(parseReturnUrl('')).toBeNull()
      expect(parseReturnUrl(undefined)).toBeNull()
      expect(parseReturnUrl(['myapp://vault/done'])).toBeNull()
    })
  })

  describe('withAuthorizedConnection on an app deep link', () => {
    it('appends authorizedConnection', () => {
      expect(withAuthorizedConnection(new URL('myapp://vault/done?x=1'), 'salesforce')).toBe(
        'myapp://vault/done?x=1&authorizedConnection=salesforce'
      )
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

    it('returns an app deep-link redirectUri', () => {
      expect(returnToAppHref('myapp://vault/done')).toBe('myapp://vault/done')
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
