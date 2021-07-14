import { IConnection } from 'types/Connection'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { useState } from 'react'

interface IProps {
  connection: IConnection
  toggleConnection: (connection: IConnection, enabled: boolean) => Promise<any>
  delay: number
}

const SuggestionCard = ({ connection, toggleConnection, delay }: IProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { name, icon, unified_api: unifiedApi, enabled } = connection

  const handleClick = async () => {
    setIsLoading(true)
    toggleConnection(connection, !enabled).then(() => setTimeout(() => setIsLoading(false), 500))
  }

  return (
    <Transition
      show={true}
      style={{ transitionDelay: `${delay}ms` }}
      enter="transition ease-out duration-200"
      enterFrom="transform opacity-50 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-150"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0"
      className={classNames(
        'mx-auto cursor-pointer relative w-full sm:w-44 xl:w-48 px-4 pt-6 pb-4 font-medium hover:shadow-md border border-gray-300 rounded-md transition duration-150',
        {
          'border-primary-600 border-2 text-gray-900 ': enabled && !isLoading,
          'text-gray-500 hover:text-gray-900': !enabled,
          'animate-pulse': isLoading
        }
      )}
      onClick={() => handleClick()}
    >
      {isLoading ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute w-6 h-6 p-1 text-gray-500 bg-white border border-gray-300 rounded-full -top-3 -right-3 animate-spin"
          fill="white"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ) : enabled ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute w-6 h-6 p-1 bg-white border rounded-full text-primary-600 border-primary-600 -top-3 -right-3"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        ''
      )}
      <div className="w-full mx-auto">
        <img className="w-12 h-12 mx-auto mb-3 rounded" src={icon} alt={name} />

        <h4 className="text-base font-medium">{name}</h4>
        <p className="text-sm font-medium text-gray-500 uppercase">{unifiedApi}</p>
      </div>
    </Transition>
  )
}

export default SuggestionCard
