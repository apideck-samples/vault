import { Select } from '@apideck/components'
import React, { Fragment } from 'react'
import { FormField, FormFieldOptionGroup } from 'types/FormField'

interface IProps {
  field: FormField
  formikProps: any
  className: string
}

const FilteredSelect = ({ field, formikProps, className }: IProps) => {
  const { handleChange, handleBlur, values } = formikProps
  const { id, required, type, options, filter } = field

  const filterOn = filter?.value
  if (!filterOn) return <Fragment />

  const filterValue: unknown = values[filterOn]
  const filterOptions = filterValue
    ? (options as FormFieldOptionGroup[]).find((optionGroup: FormFieldOptionGroup) => {
        return optionGroup.id === filterValue
      })?.options
    : []

  return (
    <Select
      name={id}
      required={required}
      options={filterOptions || []}
      onChange={handleChange}
      onBlur={handleBlur}
      defaultValue={values[id] || (type === 'multi-select' ? [] : '')}
      multiple={type === 'multi-select'}
      className={className}
      disabled={!filterValue}
    />
  )
}

export default FilteredSelect
