import Select, { OptionProps, components } from 'react-select'
import { useEffect, useRef, useState } from 'react'

import CreatableSelect from 'react-select/creatable'
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
  value?: string | string[] | readonly string[]
  handleChange: (event: any) => void
  disabled?: boolean
  options: IOptionType[]
  className?: string
  isMulti?: any
  isCreatable?: boolean
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
    fontWeight: theme.fontWeight.normal,
    '&:Active': { backgroundColor: theme.colors.primary[400] }
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

const SearchSelect = ({
  field,
  placeholder,
  value,
  handleChange,
  disabled = false,
  options,
  className = '',
  isCreatable = false,
  ...rest
}: ISelectProps) => {
  const selectRef = useRef(null) as any
  const [selectedOption, setSelectedOption] = useState<IOptionType | IOptionType[]>()

  useEffect(() => {
    if (!value) return

    let option = rest.isMulti
      ? options?.filter((option: IOptionType) => value?.includes(option.value))
      : options?.find((option: IOptionType) => option.value === value)

    if (isCreatable) {
      option = rest.isMulti ? [{ label: value, value }] : { label: value, value }
    }

    if (option) setSelectedOption(option)
  }, [isCreatable, options, rest.isMulti, value])

  const patchedOnChange = (options: any) => {
    const value = rest.isMulti ? options.map((option: IOptionType) => option.value) : options.value
    handleChange({ currentTarget: { value, name: field } })
    setSelectedOption(options)
  }

  const selectProps = {
    ref: selectRef,
    id: field,
    name: field,
    ['data-testid']: field,
    value: selectedOption,
    isDisabled: disabled,
    onChange: patchedOnChange,
    placeholder: placeholder,
    options: options,
    className: classNames(
      'text-base text-gray-600 placeholder-gray-400 border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm focus:ring-primary-500 focus:border-primary-500 react-select',
      className
    ),
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.keyCode === 27) {
        e.stopPropagation()
        selectRef?.current?.blur()
      }
    },
    components: {
      Option,
      DropdownIndicator,
      IndicatorSeparator: null
    },
    styles: customStyles,
    ...rest
  }

  return isCreatable ? (
    <CreatableSelect
      formatCreateLabel={(userInput: string) => `Select "${userInput}"`}
      {...selectProps}
    />
  ) : (
    <Select {...selectProps} />
  )
}

export default SearchSelect
