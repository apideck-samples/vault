import ChevronRightIcon from 'mdi-react/ChevronRightIcon'
import Link from 'next/link'
import { IConnection } from 'types/Connection'
interface IProps {
  connection: IConnection
}

const ConfigurableResources = ({ connection }: IProps) => {
  const { configurable_resources, unified_api, service_id } = connection
  return (
    <div className="overflow-hidden bg-white border rounded-md">
      <ul className="divide-y divide-gray-200">
        {configurable_resources.map((resource: string, index: number) => {
          return (
            <li key={`resource-${index}`}>
              <Link href={`/integrations/${unified_api}/${service_id}/${resource}`}>
                <a className="flex items-center justify-between px-4 py-4 text-gray-800 capitalize sm:px-6 hover:bg-gray-50 group">
                  <span>{resource}</span>
                  <ChevronRightIcon
                    className="transition duration-150 ease-in-out transform group-hover:translate-x-1"
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
