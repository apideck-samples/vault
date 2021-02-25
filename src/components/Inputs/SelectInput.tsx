import Select, { OptionProps, OptionsType, components } from 'react-select'

import { GroupTypeBase } from 'react-select/src/types'
import MenuDownIcon from 'mdi-react/MenuDownIcon'
import theme from 'utils/theme'
import { useRef } from 'react'

export interface IOptionType {
  value: string
  label: string
}

interface ISelectProps {
  field: string
  placeholder: string
  value: string | undefined
  handleChange: (options: IOptionType | null) => void
  options: OptionsType<IOptionType>
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
    border: `1px solid ${theme.colors.gray[300]}`,
    transition: 'none',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(66, 153, 225, 0.5)' : 'none',
    '&:hover': {
      borderColor: theme.colors.gray[300]
    }
  }),
  menu: (provided: IProvided) => ({
    ...provided,
    marginTop: '5px',
    border: `1px solid ${theme.colors.gray[300]}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
  }),
  noOptionsMessage: (provided: IProvided) => ({
    ...provided,
    fontSize: '14px'
  })
}

const DropdownIndicator = () => {
  return <MenuDownIcon className="mr-2" color={theme.colors.gray[600]} />
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

const SelectInput = ({ field, placeholder, value, handleChange, options }: ISelectProps) => {
  const selectRef = useRef<Select>(null)
  const getOptionFromValue = (value: string | undefined): OptionsType<IOptionType> | null => {
    if (!value) return null
    return options.filter((option) => option.value === value)
  }

  return (
    <Select
      ref={selectRef}
      id={field}
      name={field}
      data-testid={field}
      value={getOptionFromValue(value)}
      onChange={(option) => handleChange(option)}
      placeholder={placeholder}
      options={options}
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
