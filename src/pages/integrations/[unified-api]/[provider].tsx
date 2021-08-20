import { ConnectionForm, ConnectionPlaceholder, ErrorBlock } from 'components'
import { useEffect, useState } from 'react'

import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { applySession } from 'next-session'
import camelcaseKeys from 'camelcase-keys'
import client from 'lib/axios'
import { decode } from 'jsonwebtoken'
import { options } from 'utils/sessionOptions'
import { useRouter } from 'next/router'
import useSWR from 'swr'

interface IProps {
  connections: IConnection[]
  setConnections: (connections: IConnection[]) => void
  loading: boolean
  jwt: string
  token: JWTSession
  connectionId: string
}

const Connection = ({ token, jwt, connectionId }: IProps) => {
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

  const { data, error } = useSWR('/vault/connections', fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  })

  const connections: IConnection[] = data?.data?.data

  useEffect(() => {
    const currentConnection = connections?.filter(
      (connection: IConnection) => connection.id === connectionId
    )[0]
    if (currentConnection) {
      setConnection(currentConnection)
    }
  }, [connectionId, connections])

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
      connectionId: `${query['unified-api']}+${query['provider']}`
    }
  }
}

export default Connection
