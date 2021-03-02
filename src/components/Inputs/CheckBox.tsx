import { ChangeEvent } from 'react'

interface CheckBoxProps {
  name: string
  value?: boolean
  required?: boolean
  placeholder?: string | undefined
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void
}
const CheckBox = ({ value, ...rest }: CheckBoxProps) => {
  return (
    <input
      className="inline-block w-5 h-5 text-gray-600 border-gray-300 rounded-md"
      type="checkbox"
      data-testid={rest.name}
      checked={value}
      {...rest}
    />
  )
}

export default CheckBox
