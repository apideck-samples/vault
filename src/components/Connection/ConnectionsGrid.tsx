import GridCard from 'components/Connection/GridCard'
import { IConnection } from 'types/Connection'

interface Props {
  connections: IConnection[]
  handleClick: (connection: IConnection, i: number) => void
  isLoading: boolean | string
  cursor: boolean | number
}

const ConnectionsGrid = ({ connections, isLoading, handleClick, cursor }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-8 mb-8 text-center md:grid-cols-3 lg:grid-cols-3 md:gap-6 lg:gap-4 xl:gap-6">
      {connections?.map((connection: IConnection, i: number) => {
        const delay = Math.max(0, i * 30)
        return (
          <GridCard
            connection={connection}
            delay={delay}
            key={i}
            handleClick={() => handleClick(connection, i)}
            isLoading={isLoading === connection.id}
            isActive={cursor === i}
          />
        )
      })}
    </div>
  )
}

export default ConnectionsGrid
