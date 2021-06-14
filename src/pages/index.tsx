import { ConnectionsList, ListPlaceholder } from 'components'
import { Fragment, useContext } from 'react'

import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { SessionExpiredModalContext } from 'utils/context'
import { applySession } from 'next-session'
import client from 'lib/axios'
import { options } from 'utils/sessionOptions'

interface IProps {
  connections: IConnection[]
  setConnections: (connections: IConnection[]) => void
  loading: boolean
  jwt: string
  token: JWTSession
}

const Home = ({ connections, setConnections, loading, jwt, token }: IProps): any => {
  const { setSessionExpired } = useContext(SessionExpiredModalContext)
  const connectionsASC = connections.sort((a, b) => a.name.localeCompare(b.name))

  const connectionsPerUnifiedApiObj = connectionsASC.reduce((acc: any, item) => {
    const group = item['unified_api']
    acc[group] = acc[group] || []
    acc[group].push(item)

    return acc
  }, {})

  const noConnections = Object.keys(connectionsPerUnifiedApiObj).length === 0
  const createConnection = async (
    values: { unifiedApi: string; serviceId: string },
    successCallback: () => void,
    errorCallback: () => void
  ): Promise<void> => {
    const { unifiedApi, serviceId } = values

    try {
      const {
        data: { data }
      } = await client.patch(
        `/vault/connections/${unifiedApi}/${serviceId}`,
        { enabled: true },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            'X-APIDECK-APP-ID': token.applicationId,
            'X-APIDECK-CONSUMER-ID': token.consumerId
          }
        }
      )
      const remainingConnections = connections.filter(
        (connection: IConnection) => connection.id !== data.id
      )
      const updatedConnections: IConnection[] = [...remainingConnections, data]

      setConnections(updatedConnections)
      successCallback()
    } catch (error) {
      errorCallback()

      const { response } = error
      const { status } = response

      if (status === 401) {
        setSessionExpired(true)
      }
    }
  }

  return (
    <Fragment>
      <h1 className="text-lg font-medium text-gray-800 md:text-2xl">Manage your integrations</h1>
      {!loading ? (
        Object.keys(connectionsPerUnifiedApiObj).map((unifiedApi) => {
          const connections = connectionsPerUnifiedApiObj[unifiedApi]

          return (
            <ConnectionsList
              key={unifiedApi}
              unifiedApi={unifiedApi}
              connections={connections}
              createConnection={createConnection}
            />
          )
        })
      ) : (
        <ListPlaceholder />
      )}
      {noConnections && !loading && <div className="mt-12">No integrations available.</div>}
    </Fragment>
  )
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getServerSideProps = async ({ req, res }: any): Promise<any> => {
  await applySession(req, res, options)

  return {
    props: {
      jwt: req.session?.jwt || '',
      token: req.session?.token || {}
    }
  }
}

export default Home
