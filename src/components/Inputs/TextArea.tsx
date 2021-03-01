import { ChangeEvent } from 'react'

interface TextAreaProps {
  name: string
  placeholder: string | undefined
  required?: boolean
  value?: readonly string[]
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
}

const TextArea = (props: TextAreaProps) => {
  return (
    <textarea
      className="block w-full max-w-sm border-gray-300 rounded-md sm:text-sm"
      data-testid={props.name}
      {...props}
    />
  )
}

export default TextArea
