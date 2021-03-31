import { fireEvent, render, screen } from '../../../testUtils/testing-utils'

import { DateInput } from 'components'

describe('Date Input', () => {
  const props: any = {
    name: 'DateInput',
    type: 'date',
    value: '22-05-2021',
    required: false,
    placeholder: 'Test Placeholder',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChange: () => {}
  }

  it('should render the component', async () => {
    render(<DateInput {...props} />)

    const input = screen.getByTestId('DateInput')
    expect(input).toBeInTheDocument()
  })

  it('should show the date picker when the input is clicked', async () => {
    render(<DateInput {...props} />)

    const input = screen.getByTestId('DateInput') as HTMLInputElement
    const datePicker = screen.getByTestId('datePicker')
    fireEvent.click(input)
    expect(datePicker).toBeInTheDocument()
  })

  it('should be able to select a date', async () => {
    render(<DateInput {...props} />)

    const input = screen.getByTestId('DateInput') as HTMLInputElement
    const day1 = screen.getByTestId('day-1')
    const day5 = screen.getByTestId('day-5')
    const day15 = screen.getByTestId('day-15')

    fireEvent.click(input)
    fireEvent.click(day1)
    expect(input.value).toContain('01')

    fireEvent.click(input)
    fireEvent.click(day5)
    expect(input.value).toContain('05')

    fireEvent.click(input)
    fireEvent.click(day15)
    expect(input.value).toContain('15')
  })
})
