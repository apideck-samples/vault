import { render, screen, act, cleanup } from '../../../testUtils/testing-utils'
import LaunchPage from 'pages/oauth/launch'
import {
  OAUTH_LAUNCH_READY,
  OAUTH_LAUNCH_START,
  READY_REPEAT_INTERVAL_MS,
  GRANT_KEY_PREFIX
} from 'utils/oauthGrantHandoff'

describe('OAuth Launch Page', () => {
  const postMessageSpy = jest.fn()
  const closeSpy = jest.fn()
  let assignSpy: jest.Mock
  const originalLocation = window.location

  const setSearch = (search: string) => {
    delete (window as any).location
    window.location = {
      search,
      hash: '',
      href: `http://localhost/oauth/launch${search}`,
      assign: assignSpy
    } as any
  }

  const setOpener = (opener: unknown) => {
    Object.defineProperty(window, 'opener', {
      value: opener,
      writable: true,
      configurable: true
    })
  }

  // Dispatch a message event with a caller-controlled `source` (jsdom's
  // MessageEvent constructor rejects plain objects as `source`, so we override
  // the getter after construction).
  const dispatchMessage = (data: unknown, source: unknown) => {
    const event = new MessageEvent('message', { data: data as any })
    Object.defineProperty(event, 'source', { value: source, configurable: true })
    act(() => {
      window.dispatchEvent(event)
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    sessionStorage.clear()
    assignSpy = jest.fn()
    window.close = closeSpy
    setSearch('?service_id=test-service')
    setOpener({ postMessage: postMessageSpy })
  })

  afterEach(() => {
    jest.useRealTimers()
    setOpener(null)
    window.location = originalLocation
  })

  it('posts oauth_launch_ready to window.opener on mount when opener and storage are available', () => {
    render(<LaunchPage />)

    expect(postMessageSpy).toHaveBeenCalledWith({ type: OAUTH_LAUNCH_READY }, '*')
  })

  it('re-posts oauth_launch_ready every READY_REPEAT_INTERVAL_MS until answered', () => {
    jest.useFakeTimers()

    render(<LaunchPage />)
    const initialCalls = postMessageSpy.mock.calls.length

    act(() => {
      jest.advanceTimersByTime(READY_REPEAT_INTERVAL_MS)
    })
    const afterOne = postMessageSpy.mock.calls.length

    act(() => {
      jest.advanceTimersByTime(READY_REPEAT_INTERVAL_MS)
    })
    const afterTwo = postMessageSpy.mock.calls.length

    expect(afterOne).toBeGreaterThan(initialCalls)
    expect(afterTwo).toBeGreaterThan(afterOne)
  })

  it('renders a loud error and does NOT post ready when window.opener is null', () => {
    setOpener(null)

    render(<LaunchPage />)

    expect(screen.getByText(/can't complete the connection/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /close window/i })).toBeDefined()
    expect(postMessageSpy).not.toHaveBeenCalled()
    expect(assignSpy).not.toHaveBeenCalled()
  })

  it('renders a loud error and does NOT post ready when the sessionStorage probe fails', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled')
    })

    render(<LaunchPage />)

    expect(screen.getByText(/can't complete the connection/i)).toBeDefined()
    expect(postMessageSpy).not.toHaveBeenCalled()
    expect(assignSpy).not.toHaveBeenCalled()
  })

  it('on oauth_launch_start from window.opener: stores the grant under apideck_oauth_grant_{serviceId} and navigates via window.location.assign(authorizeUrl)', () => {
    render(<LaunchPage />)

    dispatchMessage(
      {
        type: OAUTH_LAUNCH_START,
        grant: 'grant-xyz',
        authorizeUrl: 'https://provider.example/authorize?x=1'
      },
      window.opener
    )

    expect(sessionStorage.getItem(`${GRANT_KEY_PREFIX}test-service`)).toBe('grant-xyz')
    expect(assignSpy).toHaveBeenCalledWith('https://provider.example/authorize?x=1')
  })

  it('stops re-posting oauth_launch_ready after a valid oauth_launch_start', () => {
    jest.useFakeTimers()

    render(<LaunchPage />)

    dispatchMessage(
      {
        type: OAUTH_LAUNCH_START,
        grant: 'grant-xyz',
        authorizeUrl: 'https://provider.example/authorize'
      },
      window.opener
    )

    const callsAfterStart = postMessageSpy.mock.calls.length

    act(() => {
      jest.advanceTimersByTime(READY_REPEAT_INTERVAL_MS * 4)
    })

    expect(postMessageSpy.mock.calls.length).toBe(callsAfterStart)
  })

  it('ignores oauth_launch_start whose event.source is not window.opener', () => {
    render(<LaunchPage />)

    dispatchMessage(
      {
        type: OAUTH_LAUNCH_START,
        grant: 'grant-xyz',
        authorizeUrl: 'https://provider.example/authorize'
      },
      { postMessage: jest.fn() } // a different frame, not the opener
    )

    expect(sessionStorage.getItem(`${GRANT_KEY_PREFIX}test-service`)).toBeNull()
    expect(assignSpy).not.toHaveBeenCalled()
  })

  it('ignores messages whose data.type is not oauth_launch_start', () => {
    render(<LaunchPage />)

    dispatchMessage(
      { type: 'some_other_message', grant: 'grant-xyz', authorizeUrl: 'https://x' },
      window.opener
    )

    expect(sessionStorage.getItem(`${GRANT_KEY_PREFIX}test-service`)).toBeNull()
    expect(assignSpy).not.toHaveBeenCalled()
  })

  it('clears the ready interval and removes the message listener on unmount', () => {
    jest.useFakeTimers()

    render(<LaunchPage />)
    cleanup()
    jest.clearAllMocks()

    act(() => {
      jest.advanceTimersByTime(READY_REPEAT_INTERVAL_MS * 4)
    })

    // Interval cleared: no further ready posts after unmount.
    expect(postMessageSpy).not.toHaveBeenCalled()

    // Listener removed: a post-unmount start message is ignored.
    dispatchMessage(
      {
        type: OAUTH_LAUNCH_START,
        grant: 'grant-xyz',
        authorizeUrl: 'https://provider.example/authorize'
      },
      window.opener
    )
    expect(sessionStorage.getItem(`${GRANT_KEY_PREFIX}test-service`)).toBeNull()
    expect(assignSpy).not.toHaveBeenCalled()
  })
})
