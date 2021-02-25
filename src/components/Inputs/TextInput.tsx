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
      className="block max-w-full px-2 py-1 border rounded focus:outline-none focus:shadow-outline"
      style={{ fontSize: '0.9375rem', width: '320px', height: '38px' }}
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
