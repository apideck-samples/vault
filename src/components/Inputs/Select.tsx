import { FormikProps } from 'formik'
import { FormFieldOption } from 'types/FormField'
interface IProps {
  field: string
  required: boolean
  options: FormFieldOption[]
  formikProps: FormikProps<Record<string, readonly string[]>>
  type?: string
}

const Select = ({ field, type, required = false, options = [], formikProps }: IProps) => {
  const { handleChange, handleBlur, values } = formikProps

  return (
    <select
      className="block w-full max-w-xs px-3 py-2 mt-1 text-base text-gray-600 border-gray-300 rounded-md focus:outline-none sm:text-sm "
      name={field}
      id={field}
      data-testid={field}
      required={required}
      onChange={handleChange}
      onBlur={handleBlur}
      multiple={type === 'multi-select'}
      defaultValue={!values[field] ? '' : values[field]}
    >
      <option disabled value="">
        Select an option
      </option>

      {options?.map((option, index) => {
        const { value, label } = option

        return (
          <option key={`${label}-${index}`} value={value || ''}>
            {label}
          </option>
        )
      })}
    </select>
  )
}

export default Select
