import { ParsedUrlQuery } from 'querystring'

export interface OAuthError {
  message: string
  ref: string
  details: {
    error_type: string
    error_message: string
    origin: string
    service_id?: string
    client_id?: string
    application_id?: string
  }
}

export const createOAuthErrorFromQuery = (query: ParsedUrlQuery): OAuthError | null => {
  const queryRecord = query as Record<string, string>

  if (!query.error_type) {
    return null
  }

  const details = {
    error_type: queryRecord.error_type,
    error_message: queryRecord.error_message,
    origin: queryRecord.origin,
    service_id: queryRecord.service_id,
    client_id: queryRecord.client_id,
    application_id: queryRecord.application_id
  }

  return {
    message: 'An error occurred during the authorization flow. Please try again.',
    ref: queryRecord.ref,
    details
  }
}
