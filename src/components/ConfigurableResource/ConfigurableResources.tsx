import ChevronRightIcon from 'mdi-react/ChevronRightIcon'
import Link from 'next/link'
import { IConnection } from 'types/Connection'
interface IProps {
  connection: IConnection
}

const ConfigurableResources = ({ connection }: IProps) => {
  const { configurable_resources, unified_api, service_id } = connection
  return (
    <div className="bg-white overflow-hidden border rounded-md">
      <ul className="divide-y divide-gray-200">
        {configurable_resources.map((resource: string, index: number) => {
          return (
            <li key={`resource-${index}`}>
              <Link href={`/integrations/${unified_api}/${service_id}/${resource}`}>
                <a className="px-4 py-4 sm:px-6 capitalize flex items-center justify-between">
                  <span>{resource}</span>
                  <ChevronRightIcon
                    className="transition ease-in-out"
                    color="currentColor"
                    size={24}
                  />
                </a>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ConfigurableResources
