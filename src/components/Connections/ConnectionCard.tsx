import { Button } from '@apideck/components'
import classNames from 'classnames'
import { ConnectionBadge } from 'components'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import MenuRightIcon from 'mdi-react/MenuRightIcon'
import { IConnection } from 'types/Connection'

interface IProps {
  connection: IConnection
  isLoading?: boolean
  isActive?: boolean
  isSearching?: boolean
}

const ConnectionCard = ({
  connection,
  isLoading = false,
  isActive = false,
  isSearching = false
}: IProps) => {
  const { name, icon, unified_api: unifiedApi, created_at: createdAt } = connection

  return (
    <div
      className={classNames(
        'flex items-center justify-between w-full px-4 py-3 overflow-hidden border rounded-md sm:px-5 sm:py-4 group hover:bg-gray-50 spec-connection',
        { 'bg-gray-50': isActive }
      )}
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

          <div className="text-xs text-gray-600 sm:text-sm">
            {createdAt && !isSearching
              ? `Added ${formatDistanceToNow(createdAt)} ago`
              : `${unifiedApi.toUpperCase()} API`}
          </div>
        </div>
      </div>

      <div className="flex items-center">
        {createdAt ? (
          <>
            <ConnectionBadge connection={connection} />

            <div className="hidden mx-4 text-gray-500 transition duration-150 ease-in-out md:inline-block group-hover:text-gray-800">
              <MenuRightIcon color="currentColor" />
            </div>
          </>
        ) : (
          <Button text={isLoading ? 'Add' : '+ Add'} variant="primary" isLoading={isLoading} />
        )}
      </div>
    </div>
  )
}

export default ConnectionCard
