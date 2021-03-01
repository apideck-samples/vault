import { ChangeEvent } from 'react'

interface TextAreaProps {
  name: string
  required: boolean
  placeholder: string | undefined
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
