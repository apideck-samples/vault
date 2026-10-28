const base64url = (value: string): string =>
  btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

// Builds a JWT-shaped string with an invalid signature. Only for code that decodes without
// verifying (jsonwebtoken.decode), such as getServerSideProps.
export const unsignedJwt = (claims: Record<string, unknown>): string =>
  `${base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${base64url(
    JSON.stringify(claims)
  )}.x`
