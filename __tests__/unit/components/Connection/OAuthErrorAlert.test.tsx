import { fireEvent, render, screen } from '../../../testUtils/testing-utils'

import { OAuthErrorAlert } from 'components'
import { createOAuthErrorFromQuery, OAuthError } from 'utils'
import * as navigate from 'utils/navigate'

const buildError = (ref?: string): OAuthError =>
  createOAuthErrorFromQuery({
    error_type: 'OAuthInvalidStateError',
    error_message: 'State parameter is not a valid JWT token. It may have expired.',
    origin: 'authorize',
    service_id: 'zoho-crm',
    ...(ref === undefined ? {} : { ref })
  }) as OAuthError

describe('OAuthErrorAlert', () => {
  const navigateSpy = jest.spyOn(navigate, 'navigateTo')

  beforeEach(() => {
    jest.clearAllMocks()
    navigateSpy.mockImplementation(() => undefined)
  })

  afterAll(() => {
    navigateSpy.mockRestore()
  })

  it('shows More Info for a developers.apideck.com ref and navigates to it on click', () => {
    render(
      <OAuthErrorAlert
        error={buildError('https://developers.apideck.com/errors#oauthinvalidstateerror')}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'More Info' }))

    expect(navigateSpy).toHaveBeenCalledWith(
      'https://developers.apideck.com/errors#oauthinvalidstateerror'
    )
  })

  it('hides More Info for a javascript: ref', () => {
    render(<OAuthErrorAlert error={buildError('javascript:alert(document.domain)')} />)

    expect(screen.queryByRole('button', { name: 'More Info' })).toBeNull()
  })

  it('hides More Info for a ref on another host', () => {
    render(<OAuthErrorAlert error={buildError('https://evil.example/errors')} />)

    expect(screen.queryByRole('button', { name: 'More Info' })).toBeNull()
  })

  it('hides More Info when ref is missing', () => {
    render(<OAuthErrorAlert error={buildError()} />)

    expect(screen.queryByRole('button', { name: 'More Info' })).toBeNull()
  })

  it('still toggles Technical Details', () => {
    render(<OAuthErrorAlert error={buildError('javascript:alert(document.domain)')} />)

    expect(screen.queryByText('OAuthInvalidStateError')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Show Technical Details' }))

    expect(screen.getByText('OAuthInvalidStateError')).toBeTruthy()
    expect(
      screen.getByText('State parameter is not a valid JWT token. It may have expired.')
    ).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Hide Technical Details' })).toBeTruthy()
  })
})
