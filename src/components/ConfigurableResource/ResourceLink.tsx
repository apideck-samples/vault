import client from 'lib/axios'
import ChevronRightIcon from 'mdi-react/ChevronRightIcon'
import Link from 'next/link'
import { FaExclamationTriangle } from 'react-icons/fa'
import useSWR from 'swr'
import { IConnection } from 'types/Connection'
import { FormField } from 'types/FormField'
import { JWTSession } from 'types/JWTSession'

interface IProps {
  connection: IConnection
  resource: string
  jwt: string
  token: JWTSession
}

const ResourceLink = ({ connection, resource, token, jwt }: IProps) => {
  const { unified_api: unifiedApi, service_id: provider, configurable_resources } = connection

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-APIDECK-APP-ID': token?.applicationId,
        'X-APIDECK-CONSUMER-ID': token?.consumerId
      }
    })
  }

  const url = `/vault/connections/${unifiedApi}/${provider}/${resource}/config`

  const { data } = useSWR(url, fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  })

  const hasRequiredFieldsWithoutValue = data?.data?.data?.configuration?.filter(
    (field: FormField) => field.required && !field.value
  )?.length

  return configurable_resources.includes(resource) ? (
    <Link
      href={`/integrations/${unifiedApi}/${provider}/${resource}`}
      className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 sm:px-6 hover:bg-gray-50 group"
    >
      <span className="capitalize">{resource}</span>
      <div className="flex">
        {hasRequiredFieldsWithoutValue ? (
          <div className="flex items-center px-2 py-0.5 mr-1 sm:mr-2 text-xs font-medium leading-none rounded-full bg-warning-lighter text-warning">
            <span className="mr-1 sm:mr-1.5">
              <FaExclamationTriangle />
            </span>
            <span className="hidden sm:inline-block">Configure required field(s)</span>
            <span className="sm:hidden">Required field(s)</span>
          </div>
        ) : (
          ''
        )}
        <ChevronRightIcon
          className="transition duration-150 ease-in-out transform group-hover:translate-x-1"
          color="currentColor"
          size={24}
        />
      </div>
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
