import classNames from 'classnames'
import { ConnectionCard } from 'components'
import Link from 'next/link'
import { IConnection } from 'types/Connection'

interface Props {
  connections: IConnection[]
  handleClick: (connection: IConnection, i: number) => void
  cursor: number
  isLoading: boolean | string
}

const SearchedConnectionsList = ({ connections, handleClick, cursor, isLoading }: Props) => {
  return (
    <div className="mt-6">
      {connections?.map((connection: IConnection, i: number) => {
        const { id, unified_api, service_id, state } = connection

        if (state !== 'available') {
          return (
            <Link
              href={`/integrations/${unified_api}/${service_id}`}
              key={id}
              className={classNames('block', { 'mt-5': i !== 0 })}
            >
              <ConnectionCard connection={connection} isSearching={true} isActive={cursor === i} />
            </Link>
          )
        } else {
          return (
            <button
              onClick={() => handleClick(connection, i)}
              key={id}
              className={classNames('w-full', { 'mt-5': i !== 0 })}
            >
              <ConnectionCard
                connection={connection}
                isLoading={isLoading === connection.id}
                isActive={cursor === i}
              />
            </button>
          )
        }
      })}
    </div>
  )
}

export default SearchedConnectionsList
