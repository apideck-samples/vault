import { cleanup, fireEvent, render, screen } from '../../../testUtils/testing-utils'
import CallbackPage, { getServerSideProps } from 'pages/oauth/callback'

// Same shape as unify's confirm fragment (CallbackConnectionUseCase.ts:482-492):
// confirm_token, service_id, unified_api, then optional nonce and target_origin,
// each value encodeURIComponent-encoded.
const VALID_CONFIRM_HASH =
  '#confirm_token=t&service_id=s&unified_api=crm&nonce=n&target_origin=https%3A%2F%2Fapp.example.com'

const CONNECTION_NOT_COMPLETED_TITLE = 'Connection not completed'
const LOST_OPENER_MESSAGE =
  'This window lost its connection to the app that opened it. Close it and start the connection again.'
const UNSAFE_TARGET_MESSAGE =
  'This window cannot safely hand the connection back to the app that opened it. Close it and start the connection again.'
const BROWSER_BINDING_MESSAGE =
  'This connection has to be finished in the same browser where it was started. Start again from your application.'
const GENERIC_MESSAGE = 'An error occurred during the authorization flow. Please try again.'

const ERROR_QUERY = {
  error_type: 'OAuthInvalidStateError',
  error_message: 'Something failed',
  origin: 'callback',
  service_id: 's'
}

describe('OAuth Callback Page', () => {
  const closeSpy = jest.fn()
  const postMessageSpy = jest.fn()

  const setOpener = (value: unknown) => {
    Object.defineProperty(window, 'opener', {
      value,
      writable: true,
      configurable: true
    })
  }

  const withOpener = () => setOpener({ postMessage: postMessageSpy })

  const expectHandoffError = (message: string) => {
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toContain(CONNECTION_NOT_COMPLETED_TITLE)
    expect(alert.textContent).toContain(message)
    expect(screen.getByRole('button', { name: 'Close window' })).toBeTruthy()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    window.close = closeSpy
  })

  afterEach(() => {
    setOpener(null)
    window.location.hash = ''
  })

  describe('getServerSideProps', () => {
    it('sets hasError to true when error params are present', async () => {
      const result = await getServerSideProps({
        query: { error_type: 'auth_error', error_message: 'Something failed' }
      })

      expect(result.props.hasError).toBe(true)
    })

    it('sets hasError to false when no params are present', async () => {
      const result = await getServerSideProps({ query: {} })

      expect(result.props.hasError).toBe(false)
    })
  })

  describe('confirm fragment', () => {
    it('posts oauth_complete with unifiedApi to target_origin and closes', () => {
      window.location.hash = VALID_CONFIRM_HASH
      withOpener()

      render(<CallbackPage hasError={false} query={{}} />)

      expect(postMessageSpy).toHaveBeenCalledTimes(1)
      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          type: 'oauth_complete',
          confirmToken: 't',
          serviceId: 's',
          unifiedApi: 'crm',
          nonce: 'n',
          success: true
        },
        'https://app.example.com'
      )
      expect(closeSpy).toHaveBeenCalled()
    })

    it('never posts to *', () => {
      const hashes = [
        VALID_CONFIRM_HASH,
        '#confirm_token=t&service_id=s&unified_api=crm&nonce=n&target_origin=https%3A%2F%2Fapp.example.com%2F',
        '#confirm_token=t&service_id=s&unified_api=crm&target_origin=https%3A%2F%2Fapp.example.com',
        '#confirm_token=t&service_id=s&target_origin=https%3A%2F%2Fapp.example.com',
        '#confirm_token=t&service_id=s&unified_api=crm&nonce=n',
        '#confirm_token=t&service_id=s&unified_api=crm&nonce=n&target_origin=*',
        '#confirm_token=t&service_id=s&unified_api=crm&nonce=n&target_origin=javascript%3Aalert(1)',
        '#confirm_token=t&unified_api=crm&nonce=n&target_origin=https%3A%2F%2Fapp.example.com'
      ]

      hashes.forEach((hash) => {
        window.location.hash = hash
        withOpener()
        render(<CallbackPage hasError={false} query={{}} />)
        cleanup()
      })

      expect(postMessageSpy).toHaveBeenCalled()
      postMessageSpy.mock.calls.forEach(([, targetOrigin]) => {
        expect(targetOrigin).not.toBe('*')
      })
    })

    it('posts to the origin when target_origin has a trailing slash', () => {
      window.location.hash =
        '#confirm_token=t&service_id=s&unified_api=crm&nonce=n&target_origin=https%3A%2F%2Fapp.example.com%2F'
      withOpener()

      render(<CallbackPage hasError={false} query={{}} />)

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'oauth_complete', confirmToken: 't' }),
        'https://app.example.com'
      )
      expect(closeSpy).toHaveBeenCalled()
    })

    it('posts without nonce when the fragment has none', () => {
      window.location.hash =
        '#confirm_token=t&service_id=s&unified_api=crm&target_origin=https%3A%2F%2Fapp.example.com'
      withOpener()

      render(<CallbackPage hasError={false} query={{}} />)

      expect(postMessageSpy).toHaveBeenCalledTimes(1)
      const [payload, targetOrigin] = postMessageSpy.mock.calls[0]
      expect(payload).toEqual({
        type: 'oauth_complete',
        confirmToken: 't',
        serviceId: 's',
        unifiedApi: 'crm',
        success: true
      })
      expect('nonce' in payload).toBe(false)
      expect(targetOrigin).toBe('https://app.example.com')
      expect(closeSpy).toHaveBeenCalled()
    })

    it('shows the hand-off error and does not post or close when target_origin is missing', () => {
      window.location.hash = '#confirm_token=t&service_id=s&unified_api=crm&nonce=n'
      withOpener()

      render(<CallbackPage hasError={false} query={{}} />)

      expect(postMessageSpy).not.toHaveBeenCalled()
      expect(closeSpy).not.toHaveBeenCalled()
      expectHandoffError(UNSAFE_TARGET_MESSAGE)
    })

    it('shows the hand-off error for a javascript: target_origin', () => {
      window.location.hash =
        '#confirm_token=t&service_id=s&unified_api=crm&nonce=n&target_origin=javascript%3Aalert(1)'
      withOpener()

      render(<CallbackPage hasError={false} query={{}} />)

      expect(postMessageSpy).not.toHaveBeenCalled()
      expect(closeSpy).not.toHaveBeenCalled()
      expectHandoffError(UNSAFE_TARGET_MESSAGE)
    })

    it("shows the hand-off error for target_origin '*'", () => {
      window.location.hash = '#confirm_token=t&service_id=s&unified_api=crm&nonce=n&target_origin=*'
      withOpener()

      render(<CallbackPage hasError={false} query={{}} />)

      expect(postMessageSpy).not.toHaveBeenCalled()
      expect(closeSpy).not.toHaveBeenCalled()
      expectHandoffError(UNSAFE_TARGET_MESSAGE)
    })

    it('shows the hand-off error when service_id is missing', () => {
      window.location.hash =
        '#confirm_token=t&unified_api=crm&nonce=n&target_origin=https%3A%2F%2Fapp.example.com'
      withOpener()

      render(<CallbackPage hasError={false} query={{}} />)

      expect(postMessageSpy).not.toHaveBeenCalled()
      expect(closeSpy).not.toHaveBeenCalled()
      expectHandoffError(UNSAFE_TARGET_MESSAGE)
    })

    it('shows the lost-opener error and does not close when window.opener is null', () => {
      window.location.hash = VALID_CONFIRM_HASH
      setOpener(null)

      render(<CallbackPage hasError={false} query={{}} />)

      expect(closeSpy).not.toHaveBeenCalled()
      expectHandoffError(LOST_OPENER_MESSAGE)
      expect(screen.getByRole('alert').textContent).not.toContain(UNSAFE_TARGET_MESSAGE)
    })

    it('shows the hand-off (unsafe target) error when both target_origin and window.opener are missing', () => {
      window.location.hash = '#confirm_token=t&service_id=s&unified_api=crm&nonce=n'
      setOpener(null)

      render(<CallbackPage hasError={false} query={{}} />)

      expect(closeSpy).not.toHaveBeenCalled()
      expectHandoffError(UNSAFE_TARGET_MESSAGE)
      expect(screen.getByRole('alert').textContent).not.toContain(LOST_OPENER_MESSAGE)
    })

    it('posts without unifiedApi when the fragment has no unified_api', () => {
      window.location.hash =
        '#confirm_token=t&service_id=s&nonce=n&target_origin=https%3A%2F%2Fapp.example.com'
      withOpener()

      render(<CallbackPage hasError={false} query={{}} />)

      expect(postMessageSpy).toHaveBeenCalledTimes(1)
      const [payload, targetOrigin] = postMessageSpy.mock.calls[0]
      expect(payload).toEqual({
        type: 'oauth_complete',
        confirmToken: 't',
        serviceId: 's',
        nonce: 'n',
        success: true
      })
      expect('unifiedApi' in payload).toBe(false)
      expect(targetOrigin).toBe('https://app.example.com')
      expect(closeSpy).toHaveBeenCalled()
    })
  })

  describe('errors (opener present)', () => {
    beforeEach(() => {
      withOpener()
    })

    it('does not post an error to the opener', () => {
      render(<CallbackPage hasError={true} query={ERROR_QUERY} />)

      expect(postMessageSpy).not.toHaveBeenCalled()
    })

    it('does not close the window on error', () => {
      render(<CallbackPage hasError={true} query={ERROR_QUERY} />)

      expect(closeSpy).not.toHaveBeenCalled()
    })

    it('shows the error alert and the Close window button', () => {
      render(<CallbackPage hasError={true} query={ERROR_QUERY} />)

      const alert = screen.getByRole('alert')
      expect(alert.textContent).toContain('Authorization failed. Please try again.')
      expect(alert.textContent).toContain(GENERIC_MESSAGE)
      expect(screen.getByRole('button', { name: 'Close window' })).toBeTruthy()
    })

    it('ignores a confirm fragment when error params are present', () => {
      window.location.hash = VALID_CONFIRM_HASH

      render(<CallbackPage hasError={true} query={ERROR_QUERY} />)

      expect(postMessageSpy).not.toHaveBeenCalled()
      expect(closeSpy).not.toHaveBeenCalled()
      expect(screen.getByRole('alert').textContent).toContain(GENERIC_MESSAGE)
      expect(screen.getByRole('button', { name: 'Close window' })).toBeTruthy()
    })

    it('describes OAuthBrowserBindingError as needing the same browser', () => {
      render(
        <CallbackPage
          hasError={true}
          query={{ ...ERROR_QUERY, error_type: 'OAuthBrowserBindingError' }}
        />
      )

      expect(postMessageSpy).not.toHaveBeenCalled()
      expect(closeSpy).not.toHaveBeenCalled()
      expect(screen.getByRole('alert').textContent).toContain(BROWSER_BINDING_MESSAGE)
    })

    it('shows only Close window when error_message has no error_type', () => {
      render(<CallbackPage hasError={true} query={{ error_message: 'Something failed' }} />)

      expect(postMessageSpy).not.toHaveBeenCalled()
      expect(closeSpy).not.toHaveBeenCalled()
      expect(screen.queryByRole('alert')).toBeNull()
      expect(screen.getByRole('button', { name: 'Close window' })).toBeTruthy()
    })
  })

  describe('plain redirect', () => {
    it('closes without posting when the hash is empty and there is no error', () => {
      withOpener()

      render(<CallbackPage hasError={false} query={{}} />)

      expect(closeSpy).toHaveBeenCalled()
      expect(postMessageSpy).not.toHaveBeenCalled()
      expect(screen.queryByRole('alert')).toBeNull()
    })

    it('closes when there is no opener and no params', () => {
      setOpener(null)

      render(<CallbackPage hasError={false} query={{}} />)

      expect(closeSpy).toHaveBeenCalled()
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  describe('Close button', () => {
    it('Close window calls window.close', () => {
      window.location.hash = VALID_CONFIRM_HASH
      setOpener(null)

      render(<CallbackPage hasError={false} query={{}} />)

      expect(closeSpy).not.toHaveBeenCalled()
      fireEvent.click(screen.getByRole('button', { name: 'Close window' }))
      expect(closeSpy).toHaveBeenCalledTimes(1)
    })
  })
})
