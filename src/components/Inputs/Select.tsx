import React from 'react'
import { FormFieldOption } from 'types/FormField'

interface IProps {
  field: string
  required: boolean
  options: FormFieldOption[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formikProps: any
}
const Select = ({ field, required = false, options = [], formikProps }: IProps) => {
  const { handleChange, handleBlur, values } = formikProps

  return (
    <select
      className="block max-w-full px-2 py-1 border rounded focus:outline-none focus:ring"
      style={{ fontSize: '0.9375rem', width: '320px', height: '38px' }}
      name={field}
      id={field}
      data-testid={field}
      required={required}
      onChange={handleChange}
      onBlur={handleBlur}
      defaultValue={!values[field] ? '' : values[field]}
    >
      <option disabled value="">
        Select an option
      </option>

      {options &&
        options?.map((option, index) => {
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
