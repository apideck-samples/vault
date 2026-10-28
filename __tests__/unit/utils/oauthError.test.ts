import { createOAuthErrorFromQuery } from 'utils/oauthError'

const baseQuery = {
  error_message: 'Something failed',
  origin: 'callback',
  service_id: 'zoho-crm',
  ref: 'https://developers.apideck.com/errors#oautherror'
}

describe('createOAuthErrorFromQuery', () => {
  it('uses the generic message for unknown error types', () => {
    const error = createOAuthErrorFromQuery({ ...baseQuery, error_type: 'SomethingUnknownError' })

    expect(error?.message).toBe(
      'An error occurred during the authorization flow. Please try again.'
    )
    expect(error?.details.error_type).toBe('SomethingUnknownError')
  })

  it('uses the generic message for the retired OAuthConnectionDeclinedError', () => {
    const error = createOAuthErrorFromQuery({
      ...baseQuery,
      error_type: 'OAuthConnectionDeclinedError'
    })

    expect(error?.message).toBe(
      'An error occurred during the authorization flow. Please try again.'
    )
  })

  it('uses the same-browser message for OAuthBrowserBindingError', () => {
    const error = createOAuthErrorFromQuery({
      ...baseQuery,
      error_type: 'OAuthBrowserBindingError'
    })

    expect(error?.message).toBe(
      'This connection has to be finished in the same browser where it was started. Start again from your application.'
    )
  })

  it('returns null without error_type', () => {
    expect(createOAuthErrorFromQuery(baseQuery)).toBeNull()
  })
})
