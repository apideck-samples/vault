const securityHeaders = [
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-UA-Compatible', value: 'IE=Edge' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubdomains; always' },
  {
    key: 'Permissions-Policy',
    // origin only: a slash or path would make browsers drop the whole header
    value: `fullscreen=(self "${
      new URL(process.env.NEXT_PUBLIC_VAULT_URL || 'https://vault.apideck.com').origin
    }"), geolocation=*, camera=()`
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  }
}
