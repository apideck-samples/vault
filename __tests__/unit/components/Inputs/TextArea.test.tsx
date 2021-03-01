import { fireEvent, render, screen } from '../../../testUtils/testing-utils'

import { TextArea } from 'components'

describe('Text Area', () => {
  const props = {
    name: 'AwesomeField',
    required: true,
    placeholder: 'Test Placeholder',
    onChange: () => console.log('changed')
  }

  it('should render the component', async () => {
    render(<TextArea {...props} />)

    const input = screen.getByTestId('AwesomeField')
    expect(input).toBeInTheDocument()
  })

  it('should allow letters to be inputted', async () => {
    render(<TextArea {...props} />)

    const input = screen.getByTestId('AwesomeField') as HTMLTextAreaElement

    fireEvent.change(input, { target: { value: 'Great stuff' } })
    expect(input.value).toBe('Great stuff')
  })
})
