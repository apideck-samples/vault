import React from 'react'

interface FormOption {
  value: string | number | null | undefined
  label: string
}

interface IProps {
  field: string
  required: boolean
  options: FormOption[] | null | undefined
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
