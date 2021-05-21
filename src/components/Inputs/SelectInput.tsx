import { FormFieldOption, FormFieldOptionGroup } from 'types/FormField'
import Select, { OptionProps, OptionsType, components } from 'react-select'
import { useEffect, useRef, useState } from 'react'

import { GroupTypeBase } from 'react-select/src/types'
import classNames from 'classnames'
import theme from 'utils/theme'

export interface IOptionType {
  value: string
  label: string
}

interface ISelectProps {
  field: string
  placeholder: string
  value: string | undefined
  handleChange: (event: any) => void
  options: any
  className?: string
}

interface IOptionProps extends OptionProps<IOptionType, false, GroupTypeBase<IOptionType>> {
  label: string
  data: { icon: string; name: string }
}

interface IProvided {
  [key: string]: string | number
}

const customStyles = {
  control: (provided: IProvided, state: { isFocused: boolean }) => ({
    ...provided,
    border: state.isFocused ? `1px solid transparent` : `1px solid ${theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.md,
    boxShadow: state.isFocused ? `0 0 0 2px ${theme.colors.primary[500]}` : 'none',
    '&:hover': {
      border: state.isFocused ? `1px solid transparent` : `1px solid ${theme.colors.gray[300]}`
    },
    fontFamily: theme.fontFamily['basier-circle']
  }),
  menu: (provided: IProvided) => ({
    ...provided,
    marginTop: '5px',
    border: `1px solid ${theme.colors.gray[300]}`,
    borderRadius: theme.borderRadius.md,
    boxShadow: theme.boxShadow.lg
  }),
  option: (provided: IProvided, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...provided,
    backgroundColor: state.isSelected || state.isFocused ? theme.colors.primary[500] : 'none',
    color: state.isSelected || state.isFocused ? theme.colors.white : theme.colors.gray[900],
    fontFamily: theme.fontFamily['basier-circle'],
    fontWeight: theme.fontWeight.normal
  }),
  noOptionsMessage: (provided: IProvided) => ({
    ...provided,
    fontSize: theme.fontSize.sm
  })
}

const DropdownIndicator = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 mr-2 text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

const Option = (props: IOptionProps) => {
  const { label, data } = props
  const { icon, name } = data

  return (
    <components.Option {...props}>
      <div className="flex items-center justify-start">
        {icon && (
          <img className="mr-2" style={{ width: '20px', height: '20px' }} src={icon} alt={name} />
        )}
        <span className="font-medium" style={{ fontSize: '0.9735rem' }}>
          {label}
        </span>
      </div>
    </components.Option>
  )
}

const SelectInput = ({
  field,
  placeholder,
  value,
  handleChange,
  options,
  className = ''
}: ISelectProps) => {
  const selectRef = useRef<Select>(null)
  const [selectedOption, setSelectedOption] = useState<IOptionType>()

  useEffect(() => {
    const option = options?.find((option: IOptionType) => option.value === value)
    if (option) {
      setSelectedOption(option)
    }
  }, [options, value])

  const patchedOnChange = (option: any) => {
    handleChange({ currentTarget: { value: option.value, name: field } })
    setSelectedOption(option)
  }

  return (
    <Select
      ref={selectRef}
      id={field}
      name={field}
      data-testid={field}
      value={selectedOption}
      onChange={patchedOnChange}
      placeholder={placeholder}
      options={options}
      className={classNames(
        'text-base text-gray-600 placeholder-gray-400 border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm focus:ring-primary-500 focus:border-primary-500 react-select',
        className
      )}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.keyCode === 27) {
          e.stopPropagation()
          selectRef?.current?.blur()
        }
      }}
      components={{
        Option,
        DropdownIndicator,
        IndicatorSeparator: null
      }}
      styles={customStyles}
    />
  )
}

export default SelectInput
