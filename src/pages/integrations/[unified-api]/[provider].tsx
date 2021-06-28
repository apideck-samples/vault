import { ConnectionForm, ConnectionPlaceholder, ErrorBlock } from 'components'

import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { applySession } from 'next-session'
import client from 'lib/axios'
import { options } from 'utils/sessionOptions'
import { useEffect } from 'react'
import useSWR from 'swr'
import { useState } from 'react'

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

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
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

  if ((!data && !error) || !connection) {
    return <ConnectionPlaceholder />
  }

  if (error) {
    const errorObj = error?.response ? error.response : { status: 400 }
    return <ErrorBlock error={errorObj} token={token} />
  }

  return <ConnectionForm connection={connection} token={token} jwt={jwt} />
}

export const getServerSideProps = async ({ req, res, params }: any): Promise<any> => {
  await applySession(req, res, options)

  return {
    props: {
      jwt: req.session.jwt || '',
      token: req.session.token || {},
      hideResourceSettings: req.session.hide_resource_settings || false,
      connectionId: `${params['unified-api']}+${params['provider']}`
    }
  }
}

export default Connection
