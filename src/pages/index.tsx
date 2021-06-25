import { ConnectionsList, ErrorBlock, ListPlaceholder } from 'components'
import { Fragment, useContext } from 'react'

import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { SessionExpiredModalContext } from 'utils/context'
import { applySession } from 'next-session'
import client from 'lib/axios'
import { options } from 'utils/sessionOptions'
import useSWR from 'swr'

interface IProps {
  jwt: string
  token: JWTSession
}

const Home = ({ jwt, token }: IProps): any => {
  const { setSessionExpired } = useContext(SessionExpiredModalContext)

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-APIDECK-APP-ID': token?.applicationId,
        'X-APIDECK-CONSUMER-ID': token?.consumerId
      }
    })
  }

  const { data, error, mutate } = useSWR('/vault/connections', fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  })

  const connections: IConnection[] = data?.data?.data
  const connectionsASC = connections?.sort((a, b) => a.name.localeCompare(b.name))
  const connectionsPerUnifiedApiObj = connectionsASC?.reduce((acc: any, item) => {
    const group = item['unified_api']
    acc[group] = acc[group] || []
    acc[group].push(item)

    return acc
  }, {})

  const createConnection = async (
    values: { unifiedApi: string; serviceId: string },
    successCallback: () => void,
    errorCallback: () => void
  ): Promise<void> => {
    const { unifiedApi, serviceId } = values

    try {
      await client.patch(
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
      mutate()
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

  if (error) {
    const errorObj = error?.response ? error.response : { status: 400 }
    return <ErrorBlock error={errorObj} token={token} />
  }

  return (
    <Fragment>
      <h1 className="text-lg font-medium text-gray-800 md:text-2xl">Manage your integrations</h1>
      {!data && !error && <ListPlaceholder />}
      {connections?.length &&
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
        })}
      {!data && !connections?.length && <div className="mt-12">No integrations available.</div>}
    </Fragment>
  )
}

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
