// Rules for URLs that come from query parameters or the (unverified) session JWT.
//
// Every navigation or link to a customer URL goes through these helpers, so a crafted
// `javascript:` value or a third-party origin can never be followed.
//
// APIDECK_DOCS_ORIGIN mirrors unify's DOCS_ENDPOINT, which builds the error `ref` as
// `${DOCS_ENDPOINT}/errors#<type>` (unify src/core/domain/UseCaseError.ts:34-36) and is
// `https://developers.apideck.com` in every environment (unify terraform/modules/lambda/main.tf:47).

export const APIDECK_APP_URL = 'https://app.apideck.com'
export const APIDECK_DOCS_ORIGIN = 'https://developers.apideck.com'

/**
 * An absolute http(s) URL without username or password, or null.
 * Takes `unknown` because Next query values can be arrays and the session is unverified.
 */
export const parseHttpUrl = (value: unknown): URL | null => {
  if (typeof value !== 'string' || value === '') return null

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (url.username !== '' || url.password !== '') return null

  return url
}

/**
 * The candidate as a new URL when it and the session redirect URI are both valid http(s) URLs
 * on the same origin. Otherwise null, including when the session has no redirect URI.
 */
export const allowedAppUrl = (candidate: unknown, sessionRedirectUri: unknown): URL | null => {
  const sessionUrl = parseHttpUrl(sessionRedirectUri)
  if (!sessionUrl) return null

  const url = parseHttpUrl(candidate)
  if (!url || url.origin !== sessionUrl.origin) return null

  return url
}

/**
 * Href for "Return to application": the Apideck app when the session has no redirect URI,
 * the redirect URI when it is a valid http(s) URL, otherwise null (hide the link).
 */
export const returnToAppHref = (sessionRedirectUri: unknown): string | null => {
  if (
    sessionRedirectUri === undefined ||
    sessionRedirectUri === null ||
    sessionRedirectUri === ''
  ) {
    return APIDECK_APP_URL
  }

  return parseHttpUrl(sessionRedirectUri)?.href ?? null
}

/** The href of an https URL on Apideck's docs host, otherwise null. */
export const docsUrl = (value: unknown): string | null => {
  const url = parseHttpUrl(value)
  if (!url || url.protocol !== 'https:' || url.origin !== APIDECK_DOCS_ORIGIN) return null

  return url.href
}

/**
 * The origin of a bare http(s) origin string (a trailing slash is tolerated), otherwise null.
 * `'*'` and `'null'` never parse.
 */
export const targetOrigin = (value: unknown): string | null => {
  const url = parseHttpUrl(value)
  if (!url || url.pathname !== '/' || url.search !== '' || url.hash !== '') return null

  return url.origin
}

/** Appends `authorizedConnection` to the URL and returns its href. */
export const withAuthorizedConnection = (url: URL, serviceId: string): string => {
  url.searchParams.append('authorizedConnection', serviceId)

  return url.href
}
