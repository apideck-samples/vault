import { ConnectionForm, ConnectionPlaceholder, ErrorBlock } from 'components'

import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import camelcaseKeys from 'camelcase-keys-deep'
import client from 'lib/axios'
import { decode } from 'jsonwebtoken'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useSession } from 'utils/useSession'
import { useToast } from '@apideck/components'

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
