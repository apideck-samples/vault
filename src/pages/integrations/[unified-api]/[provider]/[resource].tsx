import { ErrorBlock, ResourceForm } from 'components'
import React, { useEffect, useState } from 'react'

import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { applySession } from 'next-session'
import client from 'lib/axios'
import { options } from 'utils/sessionOptions'
import useSWR from 'swr'

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
  const [error, setError] = useState<{ status: number } | null>(null)

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-APIDECK-APP-ID': token?.applicationId,
        'X-APIDECK-CONSUMER-ID': token?.consumerId
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

      setError(errorObj)
      setLoading(false)
    }
  }, [connectionError])

  if (error) return <ErrorBlock error={error} />

  return (
    <ResourceForm
      loading={loading}
      connection={connection}
      resource={resource}
      jwt={jwt}
      token={token}
    />
  )
}

export const getServerSideProps = async ({ req, res, params }: any): Promise<any> => {
  await applySession(req, res, options)

  const { jwt, token } = req.session
  const unifiedApi = params['unified-api']
  const { provider, resource } = params

  const url = `/vault/connections/${unifiedApi}/${provider}/${resource}/config`

  return {
    props: {
      jwt,
      token,
      resource,
      url
    }
  }
}

export default Resource
