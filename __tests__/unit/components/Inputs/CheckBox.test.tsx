import { fireEvent, render, screen } from '../../../testUtils/testing-utils'

/* eslint-disable @typescript-eslint/no-empty-function */
import { CheckBox } from 'components'

describe('Check Box', () => {
  const props = {
    name: 'CheckBox',
    type: 'checkbox',
    required: true,
    placeholder: 'Test Placeholder',
    onChange: () => {},
    onBlur: () => {}
  }

  it('should render the component', async () => {
    render(<CheckBox {...props} />)

    const input = screen.getByTestId('CheckBox')
    expect(input).toBeInTheDocument()
  })

  it('should toggle the checkbox', async () => {
    render(<CheckBox {...props} />)

    const input = screen.getByTestId('CheckBox') as HTMLInputElement
    expect(input.checked).toEqual(false)
    fireEvent.click(input)
    expect(input.checked).toEqual(true)
    fireEvent.click(input)
    expect(input.checked).toEqual(false)
  })
})
