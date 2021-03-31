import { FaCircle, FaExclamationTriangle } from 'react-icons/fa'

import { IConnection } from 'types/Connection'
import Link from 'next/link'
import MenuRightIcon from 'mdi-react/MenuRightIcon'
import classNames from 'classnames'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

interface IProps {
  connection: IConnection
}

const ConnectionCard = ({ connection }: IProps) => {
  const { name, icon, unified_api, service_id, created_at: createdAt } = connection
  const isAuthorized = connection.state === 'authorized' || connection.state === 'callable'

  return (
    <Link href={`/integrations/${unified_api}/${service_id}`}>
      <button
        className="flex items-center justify-between w-full px-5 py-4 mt-5 border rounded-md group hover:bg-gray-100 spec-connection"
        data-testid={'connection-link'}
      >
        <div className="flex items-center">
          <img
            className="mr-5 rounded"
            style={{ width: '36px', height: '36px' }}
            src={icon}
            alt={name}
          />
          <div className="text-left">
            <div className="font-medium text-md spec-connection-name">{name}</div>
            <div className="text-gray-600" style={{ fontSize: '0.8125rem' }}>
              Added {formatDistanceToNow(createdAt)} ago
            </div>
          </div>
        </div>

        <div className="flex items-center">
          {isAuthorized ? (
            <div
              className={classNames(
                'flex flex-row px-2 py-1 text-xs font-medium leading-none rounded-full',
                {
                  'text-primary-600 bg-primary-100': connection.enabled,
                  'text-gray-500 bg-gray-100': !connection.enabled
                }
              )}
            >
              <span className="flex flex-col justify-center mr-2">
                <FaCircle size={8} />
              </span>
              {connection.enabled ? 'Enabled' : 'Disabled'}
            </div>
          ) : (
            <div className="flex flex-row px-2 py-1 text-xs font-medium leading-none rounded-full bg-warning-lighter text-warning">
              <span className="mr-2">
                <FaExclamationTriangle />
              </span>
              Needs configuration
            </div>
          )}

          <div className="mx-4 text-gray-500 transition duration-150 ease-in-out group-hover:text-gray-800">
            <MenuRightIcon color="currentColor" />
          </div>
        </div>
      </button>
    </Link>
  )
}

export default ConnectionCard
