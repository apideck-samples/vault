import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { ResourceLink } from 'components'

interface IProps {
  connection: IConnection
  jwt: string
  token: JWTSession
}

const ConfigurableResources = ({ connection, token, jwt }: IProps) => {
  const { configurable_resources } = connection

  return (
    <div className="overflow-hidden bg-white border rounded-md">
      <ul className="divide-y divide-gray-200">
        <li className="px-5 py-4">
          <h2 className="font-medium">Configurable Resources</h2>
        </li>
        {configurable_resources.map((resource: string, index: number) => {
          return (
            <li key={`resource-${index}`}>
              <ResourceLink connection={connection} resource={resource} token={token} jwt={jwt} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ConfigurableResources
