import client from 'lib/axios'
import useSWR from 'swr'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'

const useFetchConfig = (
  connection: IConnection,
  resource: string,
  jwt: string,
  token: JWTSession
) => {
  const { unified_api: unifiedApi, service_id: provider } = connection
  const url = `/vault/connections/${unifiedApi}/${provider}/${resource}/config`

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-APIDECK-APP-ID': token?.applicationId,
        'X-APIDECK-CONSUMER-ID': token?.consumerId
      }
    })
  }

  return useSWR(url, fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  })
}

export default useFetchConfig
