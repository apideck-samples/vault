import { ParsedUrlQuery } from 'querystring'

export interface OAuthError {
  type: string
  message: string
  origin: string
  ref: string
  full: Record<string, string>
}

export const createOAuthErrorFromQuery = (query: ParsedUrlQuery): OAuthError | null => {
  const queryRecord = query as Record<string, string>

  if (!query.error_type) {
    return null
  }

  const error = {
    error_type: queryRecord.error_type,
    error_message: queryRecord.error_message,
    origin: queryRecord.origin,
    service_id: queryRecord.service_id,
    client_id: queryRecord.client_id,
    application_id: queryRecord.application_id,
    ref: queryRecord.ref
  }

  return {
    type: error.error_type,
    message: error.error_message,
    origin: error.origin as 'authorize' | 'revoke' | 'callback',
    ref: error.ref,
    full: error
  }
}
