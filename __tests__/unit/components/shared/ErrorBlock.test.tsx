import { render, screen } from '../../../testUtils/testing-utils'

import { ErrorBlock } from 'components'
import { token } from '../../../fixtures/session'

describe('ErrorBlock', () => {
  it('links to an https redirectUri', () => {
    render(
      <ErrorBlock
        error={{ status: 401 }}
        token={{ ...token, redirectUri: 'https://app.example.com/vault' }}
      />
    )

    expect(
      screen.getByRole('link', { name: 'return to the application' }).getAttribute('href')
    ).toBe('https://app.example.com/vault')
  })

  it('shows the message without a link for a javascript: redirectUri', () => {
    render(
      <ErrorBlock
        error={{ status: 401 }}
        token={{ ...token, redirectUri: 'javascript:alert(document.domain)' }}
      />
    )

    expect(screen.queryByRole('link', { name: 'return to the application' })).toBeNull()
    expect(screen.getByText('Please return to application and start a new session.')).toBeTruthy()
  })
})
