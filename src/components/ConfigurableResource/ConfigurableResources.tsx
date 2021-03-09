import { ResourceLink } from 'components'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'

interface IProps {
  connection: IConnection
  jwt: string
  token: JWTSession
}

const ConfigurableResources = ({ connection, jwt, token }: IProps) => {
  const { configurable_resources } = connection

  return (
    <div className="overflow-hidden bg-white border rounded-md">
      <ul className="divide-y divide-gray-200">
        {configurable_resources.map((resource: string, index: number) => {
          return (
            <ResourceLink
              key={`resource-${index}`}
              connection={connection}
              resource={resource}
              jwt={jwt}
              token={token}
            />
          )
        })}
      </ul>
    </div>
  )
}

export default ConfigurableResources
