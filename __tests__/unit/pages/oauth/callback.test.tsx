import { render, screen, waitFor } from '../../../testUtils/testing-utils'
import CallbackPage, { getServerSideProps } from 'pages/oauth/callback'
import client from 'lib/axios'

jest.mock('lib/axios')

const GRANT_KEY = 'apideck_oauth_grant_test-service'

describe('OAuth Callback Page', () => {
  const closeSpy = jest.fn()
  const postMessageSpy = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorage.clear()
    window.close = closeSpy
  })

  afterEach(() => {
    // Reset window.opener
    Object.defineProperty(window, 'opener', {
      value: null,
      writable: true,
      configurable: true
    })
    // Reset hash fragment
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

  describe('when nonce and confirm_token are present in hash with window.opener', () => {
    beforeEach(() => {
      window.location.hash =
        '#nonce=test-nonce&confirm_token=test-token&service_id=test-service'
      Object.defineProperty(window, 'opener', {
        value: { postMessage: postMessageSpy },
        writable: true,
        configurable: true
      })
    })

    it('posts oauth_complete message to opener', () => {
      render(<CallbackPage hasError={false} query={{}} />)

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          type: 'oauth_complete',
          nonce: 'test-nonce',
          confirmToken: 'test-token',
          serviceId: 'test-service',
          success: true
        },
        '*'
      )
    })

    it('closes the window after postMessage', () => {
      render(<CallbackPage hasError={false} query={{}} />)

      expect(closeSpy).toHaveBeenCalled()
    })
  })

  describe('when error params are present with window.opener', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'opener', {
        value: { postMessage: postMessageSpy },
        writable: true,
        configurable: true
      })
    })

    it('posts oauth_error message to opener', () => {
      render(
        <CallbackPage
          hasError={true}
          query={{
            error_type: 'auth_error',
            error_message: 'Something failed',
            service_id: 'test-service'
          }}
        />
      )

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          type: 'oauth_error',
          error: 'auth_error',
          errorDescription: 'Something failed',
          serviceId: 'test-service'
        },
        '*'
      )
    })

    it('closes the window after posting error', () => {
      render(
        <CallbackPage
          hasError={true}
          query={{
            error_type: 'auth_error',
            error_message: 'Something failed',
            service_id: 'test-service'
          }}
        />
      )

      expect(closeSpy).toHaveBeenCalled()
    })
  })

  describe('when hash is empty and no error params', () => {
    it('closes the window without postMessage', () => {
      render(<CallbackPage hasError={false} query={{}} />)

      expect(closeSpy).toHaveBeenCalled()
      expect(postMessageSpy).not.toHaveBeenCalled()
    })
  })

  describe('when window.opener is null', () => {
    it('still closes the window without errors when no params', () => {
      Object.defineProperty(window, 'opener', {
        value: null,
        writable: true,
        configurable: true
      })

      render(<CallbackPage hasError={false} query={{}} />)

      expect(closeSpy).toHaveBeenCalled()
    })

    it('renders a loud error (not a silent close) when CSRF params present in hash but no opener', () => {
      window.location.hash =
        '#nonce=test-nonce&confirm_token=test-token&service_id=test-service'
      Object.defineProperty(window, 'opener', {
        value: null,
        writable: true,
        configurable: true
      })

      render(<CallbackPage hasError={false} query={{}} />)

      expect(screen.getByText(/could not be completed in this window/i)).toBeDefined()
      expect(postMessageSpy).not.toHaveBeenCalled()
    })
  })

  describe('grant self-confirm', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'opener', {
        value: { postMessage: postMessageSpy },
        writable: true,
        configurable: true
      })
    })

    it('when a grant is stored and hash has confirm_token/service_id/unified_api: POSTs { confirm_token, grant } unauthenticated and closes', async () => {
      sessionStorage.setItem(GRANT_KEY, 'grant-abc')
      // No nonce in the hash — the grant is the auth, so self-confirm is nonce-independent.
      window.location.hash =
        '#confirm_token=test-token&service_id=test-service&unified_api=crm'
      ;(client.post as jest.Mock).mockResolvedValue({
        data: { status_code: 200, status: 'OK', data: { confirmed: true } }
      })

      render(<CallbackPage hasError={false} query={{}} />)

      await waitFor(() => expect(closeSpy).toHaveBeenCalled())
      expect(client.post).toHaveBeenCalledWith('/vault/connections/crm/test-service/confirm', {
        confirm_token: 'test-token',
        grant: 'grant-abc'
      })
      expect(sessionStorage.getItem(GRANT_KEY)).toBeNull()
    })

    it('removes the grant from sessionStorage even before the POST resolves', () => {
      sessionStorage.setItem(GRANT_KEY, 'grant-abc')
      window.location.hash =
        '#confirm_token=test-token&service_id=test-service&unified_api=crm'
      // Never-resolving POST: the grant must already be cleared synchronously.
      ;(client.post as jest.Mock).mockReturnValue(new Promise(() => undefined))

      render(<CallbackPage hasError={false} query={{}} />)

      expect(sessionStorage.getItem(GRANT_KEY)).toBeNull()
    })

    it('does NOT post oauth_complete to opener when the grant self-confirm succeeds', async () => {
      sessionStorage.setItem(GRANT_KEY, 'grant-abc')
      // nonce + opener present so the legacy relay WOULD fire if the grant path didn't win.
      window.location.hash =
        '#nonce=test-nonce&confirm_token=test-token&service_id=test-service&unified_api=crm'
      ;(client.post as jest.Mock).mockResolvedValue({
        data: { status_code: 200, status: 'OK', data: { confirmed: true } }
      })

      render(<CallbackPage hasError={false} query={{}} />)

      await waitFor(() => expect(closeSpy).toHaveBeenCalled())
      expect(postMessageSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'oauth_complete' }),
        '*'
      )
    })

    it('falls back to legacy oauth_complete relay when self-confirm POST rejects', async () => {
      sessionStorage.setItem(GRANT_KEY, 'grant-abc')
      window.location.hash =
        '#nonce=test-nonce&confirm_token=test-token&service_id=test-service&unified_api=crm'
      ;(client.post as jest.Mock).mockRejectedValue(new Error('grant expired'))

      render(<CallbackPage hasError={false} query={{}} />)

      await waitFor(() => expect(client.post).toHaveBeenCalled())
      await waitFor(() =>
        expect(postMessageSpy).toHaveBeenCalledWith(
          {
            type: 'oauth_complete',
            nonce: 'test-nonce',
            confirmToken: 'test-token',
            serviceId: 'test-service',
            success: true
          },
          '*'
        )
      )
      expect(closeSpy).toHaveBeenCalled()
    })

    it('falls back to legacy oauth_complete relay when no grant is stored', () => {
      // No grant seeded.
      window.location.hash =
        '#nonce=test-nonce&confirm_token=test-token&service_id=test-service&unified_api=crm'

      render(<CallbackPage hasError={false} query={{}} />)

      expect(client.post).not.toHaveBeenCalled()
      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          type: 'oauth_complete',
          nonce: 'test-nonce',
          confirmToken: 'test-token',
          serviceId: 'test-service',
          success: true
        },
        '*'
      )
      expect(closeSpy).toHaveBeenCalled()
    })

    it('falls back to legacy relay when grant is stored but unified_api is absent from the hash', () => {
      sessionStorage.setItem(GRANT_KEY, 'grant-abc')
      // unify has not shipped unified_api yet; nonce + opener present for rung 2.
      window.location.hash =
        '#nonce=test-nonce&confirm_token=test-token&service_id=test-service'

      render(<CallbackPage hasError={false} query={{}} />)

      expect(client.post).not.toHaveBeenCalled()
      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          type: 'oauth_complete',
          nonce: 'test-nonce',
          confirmToken: 'test-token',
          serviceId: 'test-service',
          success: true
        },
        '*'
      )
    })
  })

  describe('null-opener success-shaped strand', () => {
    it('renders a loud error (not a silent close) when hash is success-shaped, no grant, and no opener', () => {
      window.location.hash =
        '#nonce=test-nonce&confirm_token=test-token&service_id=test-service'
      Object.defineProperty(window, 'opener', {
        value: null,
        writable: true,
        configurable: true
      })

      render(<CallbackPage hasError={false} query={{}} />)

      expect(screen.getByText(/could not be completed in this window/i)).toBeDefined()
      expect(closeSpy).not.toHaveBeenCalled()
    })

    it('closes silently (no relay, no loud error) when hash has confirm_token + service_id but NO nonce and no grant, opener present', () => {
      // Legacy relay gate still requires nonce and is NOT widened.
      window.location.hash = '#confirm_token=test-token&service_id=test-service'
      Object.defineProperty(window, 'opener', {
        value: { postMessage: postMessageSpy },
        writable: true,
        configurable: true
      })

      render(<CallbackPage hasError={false} query={{}} />)

      expect(closeSpy).toHaveBeenCalled()
      expect(postMessageSpy).not.toHaveBeenCalled()
      expect(screen.queryByText(/could not be completed in this window/i)).toBeNull()
    })
  })
})
