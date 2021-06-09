import { ConnectionBadge } from 'components'
import { IConnection } from 'types/Connection'
import Link from 'next/link'
import MenuRightIcon from 'mdi-react/MenuRightIcon'
import React from 'react'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

interface IProps {
  connection: IConnection
}

const ConnectionCard = ({ connection }: IProps) => {
  const { name, icon, unified_api, service_id, created_at: createdAt } = connection

  return (
    <Link href={`/integrations/${unified_api}/${service_id}`}>
      <button
        className="flex items-center justify-between w-full px-4 py-3 mt-5 overflow-hidden border rounded-md sm:px-5 sm:py-4 group hover:bg-gray-100 spec-connection"
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
            <div className="text-xs text-gray-600 sm:text-base">
              Added {formatDistanceToNow(createdAt)} ago
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <ConnectionBadge connection={connection} />

          <div className="hidden mx-4 text-gray-500 transition duration-150 ease-in-out md:inline-block group-hover:text-gray-800">
            <MenuRightIcon color="currentColor" />
          </div>
        </div>
      </button>
    </Link>
  )
}

export default ConnectionCard
