import { ConnectionForm, ConnectionPlaceholder, ErrorBlock } from 'components'

import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { applySession } from 'next-session'
import camelcaseKeys from 'camelcase-keys-deep'
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
  provider: string
  unifiedApi: string
}

const Connection = ({ token, jwt, unifiedApi, provider }: IProps) => {
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

  const connection: IConnection = data?.data?.data

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

  // After authorization, redirect to the provided application URL
  // if connection is callable and redirect URL is present in the query params
  if (query.redirectToAppUrl && req.session.jwt) {
    const response = await client.get(
      `/vault/connections/${query['unified-api']}/${query['provider']}`,
      {
        headers: {
          Authorization: `Bearer ${req.session.jwt}`,
          'X-APIDECK-APP-ID': req.session.token?.applicationId,
          'X-APIDECK-CONSUMER-ID': req.session.token?.consumerId
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
      jwt: req.session.jwt || '',
      token: req.session.token || {},
      hideResourceSettings: req.session.hide_resource_settings || false,
      unifiedApi: query['unified-api'],
      provider: query['provider'],
      redirectAfterAuthUrl: query?.redirectAfterAuthUrl || null
    }
  }
}

export default Connection
