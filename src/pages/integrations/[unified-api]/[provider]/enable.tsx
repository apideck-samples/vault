import { useToast } from '@apideck/components'
import { AxiosResponse } from 'axios'
import camelcaseKeys from 'camelcase-keys'
import { decode } from 'jsonwebtoken'
import client from 'lib/axios'
import { applySession } from 'next-session'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { options } from 'utils/sessionOptions'

interface IProps {
  jwt: string
  token: JWTSession
}

const AddResource = ({ jwt, token }: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const { query, push } = useRouter()
  const { addToast } = useToast()

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
              Authorization: `Bearer ${jwt || query.jwt}`,
              'X-APIDECK-APP-ID': token.applicationId,
              'X-APIDECK-CONSUMER-ID': token.consumerId
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
            push(`/integrations/${query['unified-api']}/${query.provider}?isolation=true`)
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

    enableConnection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
export async function getServerSideProps({ req, res, query }: any): Promise<any> {
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
      token: req.session.token || {}
    }
  }
}

export default AddResource
