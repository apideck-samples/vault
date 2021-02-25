import { ConnectionForm, ConnectionPlaceholder, ErrorBlock } from 'components'
import { applySession } from 'next-session'
import { useRouter } from 'next/router'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { options } from 'utils/sessionOptions'

interface IProps {
  connections: IConnection[]
  setConnections: (connections: IConnection[]) => void
  loading: boolean
  jwt: string
  token: JWTSession
  connectionId: string
}

const Connection = ({ connections, setConnections, loading, token, jwt, connectionId }: IProps) => {
  const router = useRouter()
  const connection = connections.filter(
    (connection: IConnection) => connection.id === connectionId
  )[0]

  if (loading) {
    return <ConnectionPlaceholder />
  }

  if (!connection) {
    const error = {
      status: 404
    }

    return <ErrorBlock error={error} />
  }

  const handleSubmit = async (connection: IConnection) => {
    const remainingConnections = connections.filter((connection) => connection.id !== connectionId)
    const updatedConnections = [...remainingConnections, connection]

    setConnections(updatedConnections)
  }

  const handleDelete = async (connection: IConnection) => {
    const remainingConnections = connections.filter((connection) => connection.id !== connectionId)
    const updatedConnection = {
      ...connection,
      added: false,
      enabled: false
    }
    const updatedConnections = [...remainingConnections, updatedConnection]

    setConnections(updatedConnections)

    setTimeout(() => {
      router.push('/')
    }, 3000)
  }

  return (
    <ConnectionForm
      connection={connection}
      handleSubmit={handleSubmit}
      handleDelete={handleDelete}
      token={token}
      jwt={jwt}
    />
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getServerSideProps = async ({ req, res, params }: any): Promise<any> => {
  await applySession(req, res, options)

  return {
    props: {
      jwt: req.session.jwt || '',
      token: req.session.token || {},
      connectionId: `${params['unified-api']}+${params['provider']}`
    }
  }
}

export default Connection
