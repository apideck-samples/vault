/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from '@testing-library/react'
import React, { Fragment } from 'react'

const Wrapped: React.FC = ({ children }) => {
  return (
    <Fragment>
      {children}
      <div id="modal"></div>
    </Fragment>
  )
}

const customRender = (ui: any, options = {}) => render(ui, { wrapper: Wrapped, ...options })

// re-export everything
export * from '@testing-library/react'
// override render method
export { customRender as render }
