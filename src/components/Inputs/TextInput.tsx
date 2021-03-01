import { FormikProps } from 'formik'
import classNames from 'classnames'

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
      className={classNames(
        'block text-gray-600 rounded-md border-gray-300',
        {
          'w-full max-w-xs sm:text-sm': type !== 'checkbox'
        },
        {
          'h-5 w-5 mt-2': type === 'checkbox'
        }
      )}
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
