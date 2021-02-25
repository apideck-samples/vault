import { ThemeContext } from 'utils/context'
import classNames from 'classnames'
import { useContext } from 'react'

interface IProps {
  text: string
  handleClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: string
  cssClass?: string
  disabled?: boolean
}

interface ITheme {
  primary_color: string | undefined
}

const Button = ({
  text,
  type = 'button',
  handleClick,
  disabled = false,
  variant = 'primary',
  cssClass
}: IProps) => {
  const theme = useContext(ThemeContext) as ITheme

  const primaryColor = theme?.primary_color
  let backgroundColorStyle = {}

  if (primaryColor && variant === 'primary') {
    backgroundColorStyle = { backgroundColor: theme.primary_color }
  }

  return (
    <button
      className={classNames(
        `rounded uppercase font-medium px-4 text-sm transition duration-300 ease-in-out ${
          cssClass || ''
        }`,
        {
          'bg-primary text-white shadow-md hover:shadow-lg': variant === 'primary',
          'border border-gray-300 text-gray-600 shadow hover:shadow-md': variant === 'cancel',
          'border border-red-300 text-red-600 shadow hover:shadow-md': variant === 'danger',
          'bg-red-600 text-white shadow-md hover:shadow-lg': variant === 'danger-full',
          'opacity-50': disabled
        }
      )}
      style={{
        minWidth: '80px',
        height: '36px',
        ...backgroundColorStyle
      }}
      type={type}
      disabled={disabled}
      onClick={handleClick}
    >
      {text}
    </button>
  )
}

export default Button
