import { FormikProps } from 'formik'

interface TextInputProps {
  field: string
  type: string
  required: boolean
  placeholder: string | undefined
  formikProps: FormikProps<Record<string, readonly string[]>>
}

const TextInput = ({ field, type, required = false, placeholder, formikProps }: TextInputProps) => {
  const { handleChange, handleBlur, values } = formikProps

  return (
    <input
      className="block w-full max-w-sm text-gray-600 border-gray-300 rounded-md ocus:ring-primary focus:border-primary sm:text-sm"
      value={values[field]}
      onChange={handleChange}
      onBlur={handleBlur}
      type={type}
      name={field}
      required={required}
      placeholder={placeholder}
      data-testid={field}
    />
  )
}

export default TextInput
