import { ResourceLink } from 'components'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'

interface IProps {
  connection: IConnection
  jwt: string
  token: JWTSession
}

const ConfigurableResources = ({ connection }: IProps) => {
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
              <ResourceLink connection={connection} resource={resource} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ConfigurableResources
