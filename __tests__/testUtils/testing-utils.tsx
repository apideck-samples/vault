/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from '@testing-library/react'
import { RouterContext } from 'next/dist/next-server/lib/router-context'
import { NextRouter } from 'next/router'

type RenderParams = Parameters<typeof render>
type RenderUI = RenderParams[0]
type RenderOptions = RenderParams[1] & { router?: Partial<NextRouter> }

const mockRouter: NextRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  reload: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  back: jest.fn(() => Promise.resolve(true)),
  beforePopState: jest.fn(() => Promise.resolve(true)),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true
}

const customRender = (ui: RenderUI, { router, ...options }: RenderOptions = {}) => {
  const Wrapped: React.FC = ({ children }) => {
    return (
      <RouterContext.Provider value={{ ...mockRouter, ...router }}>
        {children}
        <div id="modal"></div>
      </RouterContext.Provider>
    )
  }

  render(ui, { wrapper: Wrapped, ...options })
}

// re-export everything
export * from '@testing-library/react'
// override render method
export { customRender as render }
