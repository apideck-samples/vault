import { NextRouter } from 'next/router'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from '@testing-library/react'

type RenderParams = Parameters<typeof render>
type RenderUI = RenderParams[0]
type RenderOptions = RenderParams[1] & { router?: Partial<NextRouter> }

const customRender = (ui: RenderUI, { router, ...options }: RenderOptions = {}) => {
  const Wrapped: React.FC = ({ children }) => {
    return (
      <>
        {children}
        <div id="modal"></div>
      </>
    )
  }

  render(ui, { wrapper: Wrapped, ...options })
}

// re-export everything
export * from '@testing-library/react'
// override render method
export { customRender as render }
