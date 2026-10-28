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

const GENERIC_MESSAGE = 'An error occurred during the authorization flow. Please try again.'

// Copy for unify error types belongs to the client; query text is shown only under
// "Technical Details".
const MESSAGES_BY_ERROR_TYPE: Record<string, string> = {
  OAuthBrowserBindingError:
    'This connection has to be finished in the same browser where it was started. Start again from your application.'
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
    message: Object.prototype.hasOwnProperty.call(MESSAGES_BY_ERROR_TYPE, queryRecord.error_type)
      ? MESSAGES_BY_ERROR_TYPE[queryRecord.error_type]
      : GENERIC_MESSAGE,
    ref: queryRecord.ref,
    details
  }
}
