import ChevronRightIcon from 'mdi-react/ChevronRightIcon'
import Link from 'next/link'
import { FaExclamationTriangle } from 'react-icons/fa'
import { IConnection } from 'types/Connection'

interface IProps {
  connection: IConnection
  resource: string
}

const ResourceLink = ({ connection, resource }: IProps) => {
  const { unified_api: unifiedApi, service_id: provider, configurable_resources } = connection

  return configurable_resources.includes(resource) ? (
    <Link href={`/integrations/${unifiedApi}/${provider}/${resource}`}>
      <a className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 capitalize sm:px-6 hover:bg-gray-50 group">
        <span>{resource}</span>
        <ChevronRightIcon
          className="transition duration-150 ease-in-out transform group-hover:translate-x-1"
          color="currentColor"
          size={24}
        />
      </a>
    </Link>
  ) : (
    <a className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 capitalize sm:px-6 group">
      <span>{resource}</span>
      <div className="flex flex-row px-2 py-1 text-xs font-medium leading-none uppercase rounded-full bg-warning-lighter text-warning">
        <span className="mr-2">
          <FaExclamationTriangle />
        </span>
        {`Configuration not supported yet`}
      </div>
    </a>
  )
}

export default ResourceLink
