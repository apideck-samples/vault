import { fireEvent, render, screen } from '../../../testUtils/testing-utils'

import { SessionExpiredModal } from 'components'
import * as navigate from 'utils/navigate'

describe('SessionExpiredModal', () => {
  const navigateSpy = jest.spyOn(navigate, 'navigateTo')

  beforeEach(() => {
    jest.clearAllMocks()
    navigateSpy.mockImplementation(() => undefined)
  })

  afterAll(() => {
    navigateSpy.mockRestore()
  })

  it('navigates to an https redirectUri', () => {
    render(
      <SessionExpiredModal open setOpen={jest.fn()} redirectUri="https://app.example.com/vault" />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Return to application' }))

    expect(navigateSpy).toHaveBeenCalledWith('https://app.example.com/vault')
  })

  it('navigates to https://app.apideck.com without a redirectUri', () => {
    render(<SessionExpiredModal open setOpen={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Return to application' }))

    expect(navigateSpy).toHaveBeenCalledWith('https://app.apideck.com')
  })

  it('renders no Return button for a javascript: redirectUri', () => {
    render(
      <SessionExpiredModal
        open
        setOpen={jest.fn()}
        redirectUri="javascript:alert(document.domain)"
      />
    )

    expect(screen.getByText('Session expired')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Return to application' })).toBeNull()
  })
})
