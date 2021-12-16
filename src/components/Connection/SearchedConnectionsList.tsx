import { ConnectionCard } from 'components'
import { IConnection } from 'types/Connection'
import Link from 'next/link'
import classNames from 'classnames'

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
            <Link href={`/integrations/${unified_api}/${service_id}`} key={id}>
              <a className={classNames('block', { 'mt-5': i !== 0 })}>
                <ConnectionCard connection={connection} isActive={cursor === i} />
              </a>
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
