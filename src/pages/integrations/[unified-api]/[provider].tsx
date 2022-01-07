import { ConnectionForm, ConnectionPlaceholder, ErrorBlock } from 'components'

import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import camelcaseKeys from 'camelcase-keys-deep'
import client from 'lib/axios'
import { decode } from 'jsonwebtoken'
import useSWR from 'swr'
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
  const { session } = useSession()

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${session?.jwt || jwt}`,
        'X-APIDECK-APP-ID': session?.applicationId || token?.applicationId,
        'X-APIDECK-CONSUMER-ID': session?.consumerId || token?.consumerId
      }
    })
  }

  const { data, error } = useSWR(
    token || session ? `/vault/connections/${unifiedApi}/${provider}` : null,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false
    }
  )

  const connection: IConnection = data?.data?.data

  if (!data && !error) {
    return <ConnectionPlaceholder />
  }

  if (error || !connection) {
    const errorObj = error?.response ? error.response : { status: 400 }
    return <ErrorBlock error={errorObj} token={session || token} />
  }

  return (
    <ConnectionForm connection={connection} token={session || token} jwt={session?.jwt || jwt} />
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
  if (query.redirectToAppUrl && jwt && token?.applicationId) {
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
      res.writeHead(301, {
        Location: `${query.redirectToAppUrl}?authorizedConnection=${connection.name}`
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
