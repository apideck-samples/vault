import React, { useEffect, useState } from 'react'

import { AxiosResponse } from 'axios'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import camelcaseKeys from 'camelcase-keys-deep'
import client from 'lib/axios'
import { decode } from 'jsonwebtoken'
import { useRouter } from 'next/router'
import { useSession } from 'utils/useSession'
import { useToast } from '@apideck/components'

interface IProps {
  jwt: string
  token: JWTSession
}

const AddResource = ({ jwt, token }: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { query, push } = useRouter()
  const { addToast } = useToast()
  const { session, setSession } = useSession()

  useEffect(() => {
    if (!session && jwt?.length) {
      setSession({ ...token, jwt })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const enableConnection = () => {
      setIsLoading(true)
      setError(null)
      client
        .patch(
          `/vault/connections/${query['unified-api']}/${query.provider}`,
          {
            enabled: true
          },
          {
            headers: {
              Authorization: `Bearer ${session?.jwt}`,
              'X-APIDECK-APP-ID': `${session?.applicationId}`,
              'X-APIDECK-CONSUMER-ID': `${session?.consumerId}`
            }
          }
        )
        .then((response: AxiosResponse<{ data: IConnection; error: string }>) => {
          if (response.data?.data) {
            addToast({
              title: `${response.data?.data?.name} successfully enabled`,
              description: `You can now manage integration settings.`,
              type: 'success',
              autoClose: true
            })
            push(
              `/integrations/${query['unified-api']}/${query.provider}?isolation=true${
                query.redirectAfterAuthUrl
                  ? `&redirectAfterAuthUrl=${query.redirectAfterAuthUrl}`
                  : ''
              }`
            )
          } else {
            setError(response.data?.error)
          }
        })
        .catch((error) => {
          setError(error?.message || error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }

    if (session?.jwt && session?.applicationId && session?.consumerId && !isLoading) {
      enableConnection()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.jwt && session?.applicationId && session?.consumerId])

  if (isLoading) {
    return (
      <div>
        <div className="inline-flex items-center self-start justify-start mb-4 text-sm leading-none">
          <div className="mr-1 bg-gray-200 rounded-md" style={{ height: '18px', width: '18px' }} />
          <div
            className="bg-gray-200 rounded-md skeleton-loading"
            style={{ height: '18px', width: '200px' }}
          />
        </div>
        <div className="mt-4 border rounded-md">
          <div className="flex justify-between py-4 pl-5 align-center">
            <div className="inline-flex">
              <div className="w-8 h-8 mt-1 bg-gray-200 rounded-full skeleton-loading"></div>
              <div
                className="mt-3 ml-6 bg-gray-200 rounded skeleton-loading"
                style={{ height: '18px', width: '240px' }}
              ></div>
            </div>
            <div
              className="m-2 mr-5 bg-gray-200 rounded"
              style={{ height: '30px', width: '80px' }}
            />
          </div>
          <div className="px-5 py-6 border-t">
            <div className="ml-14">
              <div
                className="mt-1 bg-gray-200 rounded skeleton-loading"
                style={{ height: '18px', width: '240px' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoading && error) return <h1>{error}</h1>
  return <div />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getServerSideProps({ query }: any): Promise<any> {
  const { jwt } = query

  let token
  if (jwt) {
    const decoded = decode(jwt) as JWTSession
    if (decoded) {
      token = camelcaseKeys(decoded)
    }
  }

  return {
    props: {
      jwt: jwt || null,
      token: token || null
    }
  }
}

export default AddResource
