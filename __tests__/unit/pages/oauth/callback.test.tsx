import { render, screen, waitFor } from '../../../testUtils/testing-utils'

import CallbackPage from 'pages/oauth/callback'

describe('OAuth Callback Page', () => {
  let originalLocation: Location
  let closeSpy: jest.SpyInstance

  beforeEach(() => {
    originalLocation = window.location
    closeSpy = jest.spyOn(window, 'close').mockImplementation(() => {})
    Object.defineProperty(window, 'opener', {
      value: null,
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    // Restore window.location
    if (window.location !== originalLocation) {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true
      })
    }
    closeSpy.mockRestore()
    ;(window as any).opener = null
  })

  const setHash = (hash: string) => {
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        hash,
        href: `https://vault.apideck.com/oauth/callback${hash}`,
        origin: 'https://vault.apideck.com'
      },
      writable: true,
      configurable: true
    })
  }

  it('renders without errors', () => {
    render(<CallbackPage hasError={false} query={{}} />)
  })

  describe('Success path (fragments + opener)', () => {
    it('postMessages oauth_complete to opener and closes window', async () => {
      const postMessageMock = jest.fn()
      ;(window as any).opener = { postMessage: postMessageMock }

      setHash('#nonce=test-nonce&confirm_token=test-token&service_id=salesforce')

      render(<CallbackPage hasError={false} query={{}} />)

      await waitFor(() => {
        expect(postMessageMock).toHaveBeenCalledWith(
          {
            type: 'oauth_complete',
            nonce: 'test-nonce',
            confirmToken: 'test-token',
            serviceId: 'salesforce'
          },
          '*'
        )
        expect(closeSpy).toHaveBeenCalled()
      })
    })
  })

  describe('Legacy path (no fragments, no error)', () => {
    it('closes window immediately without postMessage', async () => {
      setHash('')

      render(<CallbackPage hasError={false} query={{}} />)

      await waitFor(() => {
        expect(closeSpy).toHaveBeenCalled()
      })
    })
  })

  describe('No-opener path', () => {
    it('shows informational message when opener is null but fragments are present', async () => {
      ;(window as any).opener = null

      setHash('#nonce=test-nonce&confirm_token=test-token&service_id=salesforce')

      render(<CallbackPage hasError={false} query={{}} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            'This page should be opened via Vault. Please close this window and try again.'
          )
        ).toBeDefined()
      })

      expect(closeSpy).not.toHaveBeenCalled()
    })

    it('does not render nonce or confirm_token in DOM', async () => {
      ;(window as any).opener = null
      setHash('#nonce=secret-nonce&confirm_token=secret-token&service_id=salesforce')

      render(<CallbackPage hasError={false} query={{}} />)

      await waitFor(() => {
        expect(
          screen.getByText(
            'This page should be opened via Vault. Please close this window and try again.'
          )
        ).toBeDefined()
      })

      expect(screen.queryByText('secret-nonce')).toBeNull()
      expect(screen.queryByText('secret-token')).toBeNull()
    })
  })

  describe('Error path via fragments', () => {
    it('postMessages error to opener and shows error UI', async () => {
      const postMessageMock = jest.fn()
      ;(window as any).opener = { postMessage: postMessageMock }

      setHash('#error=access_denied&error_description=User+denied+access&service_id=salesforce')

      render(<CallbackPage hasError={false} query={{}} />)

      await waitFor(() => {
        expect(postMessageMock).toHaveBeenCalledWith(
          {
            type: 'oauth_error',
            error: 'access_denied',
            errorDescription: 'User denied access',
            serviceId: 'salesforce'
          },
          '*'
        )
      })

      expect(screen.getByText('Close window')).toBeDefined()
    })
  })

  describe('Error path via query params (existing behavior)', () => {
    it('shows OAuthErrorAlert and close button', () => {
      const query = {
        error_type: 'OAuthInvalidStateError',
        error_message: 'State parameter is not valid',
        origin: 'authorize',
        service_id: 'salesforce'
      }

      render(<CallbackPage hasError={true} query={query} />)

      expect(screen.getByRole('alert')).toBeDefined()
      expect(screen.getByText('Close window')).toBeDefined()
    })
  })

  describe('Token leakage check', () => {
    it('nonce and confirm_token are not rendered in success path DOM', async () => {
      const postMessageMock = jest.fn()
      ;(window as any).opener = { postMessage: postMessageMock }

      setHash('#nonce=leak-nonce&confirm_token=leak-token&service_id=salesforce')

      render(<CallbackPage hasError={false} query={{}} />)

      await waitFor(() => {
        expect(postMessageMock).toHaveBeenCalled()
      })

      expect(screen.queryByText('leak-nonce')).toBeNull()
      expect(screen.queryByText('leak-token')).toBeNull()
    })
  })
})
