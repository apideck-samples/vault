import { ChangeEvent } from 'react'
import classNames from 'classnames'

interface TextInputProps {
  name: string
  type: string
  value?: readonly string[]
  required?: boolean
  placeholder?: string | undefined
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void
}
const TextInput = (props: TextInputProps) => {
  return (
    <input
      className={classNames(
        'block text-gray-600 rounded-md border-gray-300',
        {
          'w-full max-w-sm sm:text-sm': props.type !== 'checkbox'
        },
        {
          'h-5 w-5 mt-2': props.type === 'checkbox'
        }
      )}
      data-testid={props.name}
      {...props}
    />
  )
}

export default TextInput
