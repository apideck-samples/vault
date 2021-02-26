import { FormikProps } from 'formik'

interface TextAreaProps {
  field: string
  required: boolean
  placeholder: string | undefined
  formikProps: FormikProps<Record<string, readonly string[]>>
}

const TextArea = ({ field, required = false, placeholder, formikProps }: TextAreaProps) => {
  const { handleChange, handleBlur, values } = formikProps

  return (
    <textarea
      className="block w-full max-w-sm border-gray-300 rounded-md sm:text-sm"
      value={values[field]}
      onChange={handleChange}
      onBlur={handleBlur}
      name={field}
      required={required}
      placeholder={placeholder}
      data-testid={field}
    />
  )
}

export default TextArea
