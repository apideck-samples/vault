import { ErrorBlock, ResourceForm } from 'components'
import React, { useEffect, useState } from 'react'

import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import camelcaseKeys from 'camelcase-keys-deep'
import client from 'lib/axios'
import { decode } from 'jsonwebtoken'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useSession } from 'utils/useSession'
import { useToast } from '@apideck/components'

interface IProps {
  connection: IConnection
  jwt: string
  token: JWTSession
  url: string
  resource: string
}

const Resource = ({ jwt, token, url, resource }: IProps) => {
  const [connection, setConnection] = useState<IConnection>()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<{ status: number; data?: any } | null>(null)
  const { query } = useRouter()
  const { addToast } = useToast()
  const { back } = useRouter()

  const { session, setSession } = useSession()

  useEffect(() => {
    if (!session && jwt?.length) {
      setSession({ ...token, jwt })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${session?.jwt || jwt || query.jwt}`,
        'X-APIDECK-APP-ID': session?.jwt || token?.applicationId,
        'X-APIDECK-CONSUMER-ID': session?.consumerId || token?.consumerId
      }
    })
  }

  const { data, error: connectionError } = useSWR(url, fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  })

  useEffect(() => {
    if (data) {
      setConnection(data.data.data)
      setLoading(false)
    }
  }, [data])

  useEffect(() => {
    if (connectionError) {
      const { response } = connectionError
      const errorObj = response ? response : { status: 400 }

      if (errorObj.data && !error) {
        const message = errorObj.data.message || errorObj.data.detail
        addToast({
          title: `Something went wrong`,
          description: message,
          type: 'error',
          closeAfter: 6000
        })
        back()
      }

      setError(errorObj)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionError])

  if (error && !error.data) {
    return <ErrorBlock error={error || { status: 404 }} />
  }

  return (
    <ResourceForm
      loading={loading}
      connection={connection}
      resource={resource}
      jwt={jwt || session?.jwt}
      token={token || session}
    />
  )
}

export const getServerSideProps = async ({ query }: any): Promise<any> => {
  const unifiedApi = query['unified-api']
  const { provider, resource, jwt } = query

  let token
  if (jwt) {
    const decoded = decode(jwt) as JWTSession
    if (decoded) {
      token = camelcaseKeys(decoded)
    }
  }

  const url = `/vault/connections/${unifiedApi}/${provider}/${resource}/config`

  return {
    props: {
      jwt: jwt || null,
      token: token || null,
      resource,
      url
    }
  }
}

export default Resource
