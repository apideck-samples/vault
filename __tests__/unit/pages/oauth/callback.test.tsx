import { render, screen } from '../../../testUtils/testing-utils'
import CallbackPage, { getServerSideProps } from 'pages/oauth/callback'

describe('CallbackPage', () => {
  let closeSpy: jest.SpyInstance

  beforeEach(() => {
    closeSpy = jest.spyOn(window, 'close').mockImplementation(() => undefined)
  })

  afterEach(() => {
    closeSpy.mockRestore()
    delete (window as any).opener
  })

  describe('when confirm_token is present with window.opener', () => {
    it('calls postMessage with confirm token then closes window', () => {
      const postMessageMock = jest.fn()
      ;(window as any).opener = { postMessage: postMessageMock }

      render(
        <CallbackPage
          hasError={false}
          confirmToken="test-token-123"
          query={{}}
        />
      )

      expect(postMessageMock).toHaveBeenCalledWith(
        { type: 'oauth-confirm', confirmToken: 'test-token-123' },
        '*'
      )
      expect(closeSpy).toHaveBeenCalled()
    })
  })

  describe('when confirm_token is present without window.opener', () => {
    it('closes window without calling postMessage', () => {
      delete (window as any).opener

      render(
        <CallbackPage
          hasError={false}
          confirmToken="test-token-456"
          query={{}}
        />
      )

      expect(closeSpy).toHaveBeenCalled()
    })
  })

  describe('when no confirm_token and no error params (backward compat)', () => {
    it('closes window', () => {
      render(
        <CallbackPage hasError={false} confirmToken={null} query={{}} />
      )

      expect(closeSpy).toHaveBeenCalled()
    })
  })

  describe('when error params are present', () => {
    it('shows error alert and does not call postMessage', () => {
      const postMessageMock = jest.fn()
      ;(window as any).opener = { postMessage: postMessageMock }

      const errorQuery = {
        error_type: 'OAuthInvalidStateError',
        error_message: 'State parameter is not valid.',
        origin: 'authorize',
        ref: 'https://developers.apideck.com/errors#oauthinvalidstateerror'
      }

      render(
        <CallbackPage
          hasError={true}
          confirmToken={null}
          query={errorQuery}
        />
      )

      expect(postMessageMock).not.toHaveBeenCalled()
      expect(closeSpy).not.toHaveBeenCalled()
      expect(screen.getByRole('alert')).toBeDefined()
    })

    it('shows error alert even when confirm_token is also present', () => {
      const postMessageMock = jest.fn()
      ;(window as any).opener = { postMessage: postMessageMock }

      const errorQuery = {
        error_type: 'OAuthInvalidStateError',
        error_message: 'State parameter is not valid.',
        origin: 'authorize',
        ref: 'https://developers.apideck.com/errors#oauthinvalidstateerror'
      }

      render(
        <CallbackPage
          hasError={true}
          confirmToken="test-token-789"
          query={errorQuery}
        />
      )

      expect(postMessageMock).not.toHaveBeenCalled()
      expect(closeSpy).not.toHaveBeenCalled()
    })
  })
})

describe('getServerSideProps', () => {
  it('returns hasError false and confirmToken when only confirm_token is present', async () => {
    const result = await getServerSideProps({
      query: { confirm_token: 'abc-123' }
    })

    expect(result.props.hasError).toBe(false)
    expect(result.props.confirmToken).toBe('abc-123')
  })

  it('returns hasError true when error params are present', async () => {
    const result = await getServerSideProps({
      query: {
        error_type: 'SomeError',
        error_message: 'Something went wrong',
        confirm_token: 'abc-123'
      }
    })

    expect(result.props.hasError).toBe(true)
    expect(result.props.confirmToken).toBe('abc-123')
  })

  it('returns hasError false and confirmToken null when no params', async () => {
    const result = await getServerSideProps({ query: {} })

    expect(result.props.hasError).toBe(false)
    expect(result.props.confirmToken).toBeNull()
  })

  it('returns hasError true when error_description is present', async () => {
    const result = await getServerSideProps({
      query: { error_description: 'access denied' }
    })

    expect(result.props.hasError).toBe(true)
    expect(result.props.confirmToken).toBeNull()
  })

  it('passes query without confirm_token to component', async () => {
    const result = await getServerSideProps({
      query: {
        confirm_token: 'abc-123',
        error_type: 'SomeError'
      }
    })

    expect(result.props.query).toEqual({
      error_type: 'SomeError'
    })
  })
})
