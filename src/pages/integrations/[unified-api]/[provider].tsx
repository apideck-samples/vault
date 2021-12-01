import camelcaseKeys from 'camelcase-keys-deep'
import { ConnectionForm, ConnectionPlaceholder, ErrorBlock } from 'components'
import { decode } from 'jsonwebtoken'
import client from 'lib/axios'
import { applySession } from 'next-session'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { options } from 'utils/sessionOptions'

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
  const [connection, setConnection] = useState<IConnection>()
  const { query } = useRouter()

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt || query.jwt}`,
        'X-APIDECK-APP-ID': token?.applicationId,
        'X-APIDECK-CONSUMER-ID': token?.consumerId
      }
    })
  }

  const { data, error } = useSWR(`/vault/connections/${unifiedApi}/${provider}`, fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  })

  const currentConnection: IConnection = data?.data?.data

  useEffect(() => {
    if (currentConnection) {
      setConnection(currentConnection)
    }
  }, [currentConnection])

  if (!data && !error) {
    return <ConnectionPlaceholder />
  }

  if (error || !connection) {
    const errorObj = error?.response ? error.response : { status: 400 }
    return <ErrorBlock error={errorObj} token={token} />
  }

  return <ConnectionForm connection={connection} token={token} jwt={jwt} />
}

export const getServerSideProps = async ({ req, res, query }: any): Promise<any> => {
  await applySession(req, res, options)

  const { jwt } = query
  if (jwt) {
    req.session.jwt = jwt
    const decoded = decode(jwt) as JWTSession
    if (decoded) req.session.token = camelcaseKeys(decoded)
  }

  return {
    props: {
      jwt: req.session.jwt || '',
      token: req.session.token || {},
      hideResourceSettings: req.session.hide_resource_settings || false,
      unifiedApi: query['unified-api'],
      provider: query['provider']
    }
  }
}

export default Connection
