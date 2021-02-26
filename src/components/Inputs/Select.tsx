import { FormikProps } from 'formik'
import React from 'react'

interface FormOption {
  value: string | number | null | undefined
  label: string
}

interface IProps {
  field: string
  required: boolean
  options: FormOption[]
  formikProps: FormikProps<{ [key: string]: string | number }>
}

const Select = ({ field, required = false, options = [], formikProps }: IProps) => {
  const { handleChange, handleBlur, values } = formikProps

  return (
    <select
      className="block w-full max-w-sm py-2 pl-3 pr-10 mt-1 text-base text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
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
        options?.map((option) => {
          const { value, label } = option

          return (
            <option key={value} value={value || ''}>
              {label}
            </option>
          )
        })}
    </select>
  )
}

export default Select
