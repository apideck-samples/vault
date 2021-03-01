import { fireEvent, render, screen } from '../../../testUtils/testing-utils'

/* eslint-disable @typescript-eslint/no-empty-function */
import { TextInput } from 'components'

describe('Text Area', () => {
  describe('When type is text', () => {
    const props = {
      name: 'TextInput',
      type: 'text',
      required: true,
      placeholder: 'Test Placeholder',
      onChange: () => {},
      onBlur: () => {}
    }

    it('should render the component', async () => {
      render(<TextInput {...props} />)

      const input = screen.getByTestId('TextInput')
      expect(input).toBeInTheDocument()
    })

    it('should allow letters to be inputted', async () => {
      render(<TextInput {...props} />)

      const input = screen.getByTestId('TextInput') as HTMLInputElement

      fireEvent.change(input, { target: { value: 'Great stuff' } })
      expect(input.value).toBe('Great stuff')
    })
  })
  describe('When type is number', () => {
    const props = {
      name: 'NumberInput',
      type: 'number',
      required: true,
      placeholder: 'Test Placeholder',
      onChange: () => {},
      onBlur: () => {}
    }

    it('should render the component', async () => {
      render(<TextInput {...props} />)

      const input = screen.getByTestId('NumberInput')
      expect(input).toBeInTheDocument()
    })

    it('should allow numbers to be inputted', async () => {
      render(<TextInput {...props} />)

      const input = screen.getByTestId('NumberInput') as HTMLInputElement
      fireEvent.change(input, { target: { value: 23 } })
      expect(input.value).toBe('23')
    })

    it('should not allow letters to be inputted', async () => {
      render(<TextInput {...props} />)

      const input = screen.getByTestId('NumberInput') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'Great stuff' } })
      expect(input.value).toBe('')
    })
  })
  describe('When type is checkbox', () => {
    const props = {
      name: 'CheckBox',
      type: 'checkbox',
      required: true,
      placeholder: 'Test Placeholder',
      onChange: () => {},
      onBlur: () => {}
    }

    it('should render the component', async () => {
      render(<TextInput {...props} />)

      const input = screen.getByTestId('CheckBox')
      expect(input).toBeInTheDocument()
    })

    it('should toggle the checkbox', async () => {
      render(<TextInput {...props} />)

      const input = screen.getByTestId('CheckBox') as HTMLInputElement
      expect(input.checked).toEqual(false)
      fireEvent.click(input)
      expect(input.checked).toEqual(true)
      fireEvent.click(input)
      expect(input.checked).toEqual(false)
    })
  })
  describe('When type is email', () => {
    const props = {
      name: 'EmailInput',
      type: 'email',
      required: true,
      placeholder: 'Test Placeholder',
      onChange: () => {},
      onBlur: () => {}
    }

    it('should render the component', async () => {
      render(<TextInput {...props} />)

      const input = screen.getByTestId('EmailInput')
      expect(input).toBeInTheDocument()
    })

    it('should allow emails addresses to be inputted', async () => {
      render(<TextInput {...props} />)

      const input = screen.getByTestId('EmailInput') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'jake@apideck.com' } })
      expect(input.value).toBe('jake@apideck.com')
    })
  })
})
