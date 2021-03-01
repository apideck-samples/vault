import classNames from 'classnames'
import { FormikProps } from 'formik'
import { useEffect, useRef, useState } from 'react'
interface IProps {
  field: string
  formikProps: FormikProps<Record<string, readonly string[]>>
  required?: boolean
  placeholder?: string | undefined
}

const DateInput: React.FC<IProps> = ({
  field,
  required = false,
  placeholder = 'Select date',
  formikProps
}) => {
  const { handleChange } = formikProps
  const inputRef = useRef<HTMLInputElement>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerValue, setDatePickerValue] = useState('')
  const [year, setYear] = useState(1)
  const [month, setMonth] = useState(2021)
  const [numberOfDays, setNumberOfDays] = useState<number[]>([])
  const [blankDays, setBlankDays] = useState<number[]>([])
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  useEffect(() => {
    initDate()
  }, [])

  useEffect(() => {
    const getNumberOfDays = () => {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const dayOfWeek = new Date(year, month).getDay()
      const blankDaysArray = []
      const daysArray = []
      for (let i = 1; i <= dayOfWeek; i++) blankDaysArray.push(i)
      for (let i = 1; i <= daysInMonth; i++) daysArray.push(i)

      setBlankDays(blankDaysArray)
      setNumberOfDays(daysArray)
    }

    getNumberOfDays()
  }, [month, year])

  const initDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    setMonth(month)
    setYear(year)
    const formattedDate = `${year}-${('0' + (month + 1)).slice(-2)}-${('0' + today.getDate()).slice(
      -2
    )}`
    setDatePickerValue(formattedDate)
  }

  const isToday = (day: number) => {
    const today = new Date()
    const selectedDay = new Date(year, month, day)

    return today.toDateString() === selectedDay.toDateString()
  }

  const getDateValue = (day: number) => {
    const selectedDate = new Date(year, month, day)
    const formattedDate = `${selectedDate.getFullYear()}-${(
      '0' +
      (selectedDate.getMonth() + 1)
    ).slice(-2)}-${('0' + selectedDate.getDate()).slice(-2)}`

    if (inputRef?.current) {
      const event = new Event('input', { bubbles: true })
      inputRef.current.value = formattedDate
      inputRef.current.dispatchEvent(event)
      handleChange(event)
    }

    setDatePickerValue(formattedDate)
    setShowDatePicker(false)
  }

  const prevMonth = () => {
    const isLastYear = month - 1 < 0
    if (isLastYear) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const nextMonth = () => {
    const isNextYear = month + 1 > 11
    if (isNextYear) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  return (
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        readOnly
        ref={inputRef}
        onClick={() => setShowDatePicker(!showDatePicker)}
        value={datePickerValue}
        name={field}
        required={required}
        className="block w-full max-w-xs text-gray-600 border-gray-300 rounded-md sm:text-sm"
        placeholder={placeholder}
      />
      <div className="absolute top-0 right-0 z-10 px-3 py-2">
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div
        className={classNames('absolute top-0 left-0 z-20 p-4 mt-12 bg-white rounded-md shadow', {
          hidden: !showDatePicker
        })}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-lg font-bold text-gray-800">{monthNames[month]}</span>
            <input
              className="inline-block w-20 px-2 py-1 ml-1 text-lg font-normal text-gray-600 border-none rounded focus:border-none"
              value={year}
              type="number"
              onChange={(e) => setYear(+e.target.value)}
            />
          </div>
          <div>
            <button
              type="button"
              className="inline-flex p-1 transition duration-100 ease-in-out rounded-full cursor-pointer hover:bg-gray-200"
              onClick={() => prevMonth()}
            >
              <svg
                className="inline-flex w-6 h-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex p-1 transition duration-100 ease-in-out rounded-full cursor-pointer hover:bg-gray-200"
              onClick={() => nextMonth()}
            >
              <svg
                className="inline-flex w-6 h-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap mb-3 -mx-1">
          {days?.map((day, index) => {
            return (
              <div style={{ width: '14.26%' }} className="px-1" key={`${day}-${index}`}>
                <div className="text-xs font-medium text-center text-gray-800">{day}</div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap -mx-1">
          {blankDays?.map((day) => {
            return (
              <div
                key={day}
                style={{ width: '14.28%' }}
                className="p-1 text-sm text-center border border-transparent"
              ></div>
            )
          })}
          {numberOfDays?.map((day, index) => {
            return (
              <div style={{ width: '14.28%' }} className="px-1 mb-1" key={index}>
                <div
                  onClick={() => getDateValue(day)}
                  className={classNames(
                    'text-sm leading-loose text-center transition duration-100 ease-in-out rounded-md cursor-pointer',
                    {
                      'bg-primary text-white': isToday(day),
                      'text-gray-700 hover:bg-indigo-200': !isToday(day)
                    }
                  )}
                >
                  {day}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DateInput
