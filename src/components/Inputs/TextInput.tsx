import { ChangeEvent } from 'react'

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
      className="inline-block w-full max-w-sm text-gray-600 border-gray-300 rounded-md sm:text-sm"
      data-testid={props.name}
      {...props}
    />
  )
}

export default TextInput
