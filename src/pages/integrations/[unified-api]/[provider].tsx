import { ConnectionForm, ConnectionPlaceholder, ErrorBlock } from 'components'

import { useToast } from '@apideck/components'
import camelcaseKeys from 'camelcase-keys-deep'
import CustomMappings from 'components/FieldMapping/CustomMappings'
import { decode } from 'jsonwebtoken'
import client from 'lib/axios'
import HelpCircleOutlineIcon from 'mdi-react/HelpCircleOutlineIcon'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useSWR from 'swr'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { useSession } from 'utils/useSession'

interface IProps {
  connections: IConnection[]
  setConnections: (connections: IConnection[]) => void
  loading: boolean
  jwt: string
  token: JWTSession
  provider: string
  unifiedApi: string
}

const Connection = ({ token, jwt, unifiedApi, provider }: IProps) => {
  const { session, setSession } = useSession()
  const { addToast } = useToast()
  const { query } = useRouter()

  useEffect(() => {
    if (jwt?.length && token) {
      setSession({ ...token, jwt })
    }
  }, [jwt, setSession, token])

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt || session?.jwt}`,
        'X-APIDECK-APP-ID': `${token?.applicationId || session?.applicationId}`,
        'X-APIDECK-CONSUMER-ID': `${token?.consumerId || session?.consumerId}`
      }
    })
  }

  const { data, error } = useSWR(
    session?.jwt || jwt ? `/vault/connections/${unifiedApi}/${provider}` : null,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false
    }
  )

  const connection: IConnection = data?.data?.data

  useEffect(() => {
    if (query?.redirectToAppUrl && connection?.state === 'callable') {
      addToast({
        title: 'Connection is ready',
        description: 'You will now get redirected back to the application.'
      })
      setTimeout(() => {
        const parsedRedirect = new URL(query.redirectToAppUrl as string)
        parsedRedirect.searchParams.append('authorizedConnection', connection.service_id)
        window.location.href = parsedRedirect.href
      }, 3000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection?.state, query?.redirectToAppUrl])

  if (!data && !error && !session && !jwt) {
    return <ErrorBlock error={{ status: 401 }} />
  }

  if (!data && !error) {
    return <ConnectionPlaceholder />
  }

  if (error || !connection) {
    const errorObj = error?.response ? error.response : { status: 400 }
    return <ErrorBlock error={errorObj} token={session || token} />
  }

  return (
    <div>
      <ConnectionForm connection={connection} token={session || token} jwt={session?.jwt || jwt} />
      {connection.state === 'callable' && connection.custom_mappings?.length > 0 && (
        <div className="mt-10 border rounded-md overflow-hidden">
          <div className="px-5 py-4">
            <h2 className="font-medium">Custom mappings</h2>
          </div>
          <div className="bg-gray-100 border-t">
            <CustomMappings connection={connection} />
          </div>
          <div className="flex items-center justify-between px-5 py-2 bg-white h-[50px] border-t">
            <div className="flex text-sm items-center text-gray-600">
              <HelpCircleOutlineIcon className="mr-1" color="currentColor" size={20} />
              <span>
                Map properties from your <span className="font-medium">{connection.name}</span> data
                to one of the fields above.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const getServerSideProps = async ({ res, query }: any): Promise<any> => {
  let token

  const { jwt } = query
  if (jwt) {
    const decoded = decode(jwt) as JWTSession
    if (decoded) {
      token = camelcaseKeys(decoded) as any
    }
  }

  // After authorization, redirect to the provided application URL
  // if connection is callable and redirect URL is present in the query params
  if (typeof query.redirectToAppUrl === 'string' && jwt && token?.applicationId) {
    const response = await client.get(
      `/vault/connections/${query['unified-api']}/${query['provider']}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          'X-APIDECK-APP-ID': token?.applicationId,
          'X-APIDECK-CONSUMER-ID': token?.consumerId
        }
      }
    )
    const connection: IConnection = response?.data?.data
    if (connection?.state === 'callable') {
      const parsedRedirect = new URL(query.redirectToAppUrl)
      parsedRedirect.searchParams.append('authorizedConnection', connection.service_id)

      res.writeHead(301, {
        Location: parsedRedirect.href
      })
      res.end()
    }
  }

  return {
    props: {
      jwt: jwt || null,
      token: token || null,
      unifiedApi: query['unified-api'],
      provider: query['provider'],
      redirectAfterAuthUrl: query?.redirectAfterAuthUrl || null
    }
  }
}

export default Connection
