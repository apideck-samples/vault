import ChevronRightIcon from 'mdi-react/ChevronRightIcon'
import { FaExclamationTriangle } from 'react-icons/fa'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import Link from 'next/link'
import useFetchConfig from 'utils/useFetchConfig'

interface IProps {
  connection: IConnection
  jwt: string
  token: JWTSession
  resource: string
}

const ResourceLink = ({ connection, jwt, token, resource }: IProps) => {
  const { unified_api: unifiedApi, service_id: provider } = connection
  const { data, error } = useFetchConfig(connection, resource, jwt, token)
  const loading = !data && !error

  if (loading || error) {
    return (
      <a className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 capitalize sm:px-6 group">
        {loading ? (
          <>
            <div className="w-32 h-2 my-2 bg-gray-200 rounded" />
            <ChevronRightIcon className="text-gray-200" color="currentColor" size={24} />
          </>
        ) : (
          <>
            <span>{resource}</span>
            <div className="flex flex-row px-2 py-1 text-xs font-medium leading-none uppercase rounded-full bg-warning-lighter text-warning">
              <span className="mr-2">
                <FaExclamationTriangle />
              </span>
              {`Configuration not supported yet`}
            </div>
          </>
        )}
      </a>
    )
  }

  return (
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
  )
}

export default ResourceLink
