import classNames from 'classnames'
import { MouseEventHandler } from 'react'
import { IConnection } from 'types/Connection'

interface IProps {
  connection: IConnection
  delay: number
  handleClick: MouseEventHandler<HTMLDivElement>
  isLoading: boolean
  isActive: boolean
}

const GridCard = ({ connection, handleClick, isLoading, isActive = false }: IProps) => {
  const { name, icon, unified_api: unifiedApi } = connection

  return (
    <div
      className={classNames(
        'mx-auto cursor-pointer relative w-full px-3 sm:px-4 pt-6 pb-4 font-medium hover:shadow-sm border border-gray-200 hover:border-blue-500 rounded-md transition duration-150 ease-in-out text-gray-700 hover:text-gray-900',
        {
          'animate-pulse': isLoading,
          'bg-gray-50 shadow-sm': isActive
        }
      )}
      onClick={handleClick}
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
      ) : null}
      <div className="w-full mx-auto overflow-hidden">
        <img className="w-12 h-12 mx-auto mb-3 rounded" src={icon} alt={name} />
        <h4 className="text-sm font-medium truncate sm:text-base">{name}</h4>
        <p className="text-xs text-gray-500 mt-1 uppercase">{unifiedApi}</p>
      </div>
    </div>
  )
}

export default GridCard
