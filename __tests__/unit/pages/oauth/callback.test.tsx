import { render } from '../../../testUtils/testing-utils'
import CallbackPage, { getServerSideProps } from 'pages/oauth/callback'

describe('OAuth Callback Page', () => {
  const closeSpy = jest.fn()
  const postMessageSpy = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
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

    it('does not throw when CSRF params present in hash but no opener', () => {
      window.location.hash =
        '#nonce=test-nonce&confirm_token=test-token&service_id=test-service'
      Object.defineProperty(window, 'opener', {
        value: null,
        writable: true,
        configurable: true
      })

      expect(() => {
        render(<CallbackPage hasError={false} query={{}} />)
      }).not.toThrow()
    })
  })
})
