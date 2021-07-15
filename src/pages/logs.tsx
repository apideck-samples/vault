import ErrorBlock from 'components/shared/ErrorBlock'
import { JWTSession } from 'types/JWTSession'
import LogsTable from 'components/Logs/LogsTable'
import { Waypoint } from 'react-waypoint'
import { applySession } from 'next-session'
import client from 'lib/axios'
import { options } from 'utils/sessionOptions'
import { useSWRInfinite } from 'swr'

interface IProps {
  jwt: string
  token: JWTSession
}

const LogsPage = ({ jwt, token }: IProps) => {
  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-APIDECK-APP-ID': token?.applicationId,
        'X-APIDECK-CONSUMER-ID': token?.consumerId
      }
    })
  }

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData?.data?.data?.length) return null
    if (pageIndex === 0) return `/vault/logs?filter[exclude_unified_apis][0]=vault`
    const cursor = previousPageData?.data?.meta?.cursors?.next
    return `/vault/logs?filter[exclude_unified_apis][0]=vault&cursor=${cursor}`
  }

  const { data, setSize, size, error } = useSWRInfinite(getKey, fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  })

  const nextPage = () => {
    const nextCursor = data?.length && data[data.length - 1]?.data?.meta?.cursors?.next

    if (nextCursor) {
      setSize(size + 1)
    }
  }

  if (error) {
    const errorObj = error?.response ? error.response : { status: 400 }
    return <ErrorBlock error={errorObj} token={token} />
  }

  const isLoading = !data && !error
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined'
  const logs = data?.map((page) => page?.data?.data).flat() || []

  return (
    <div>
      <h1 className="mb-4 text-lg font-medium text-gray-800 md:mb-6 lg:mb-8 md:text-2xl">Logs</h1>
      <LogsTable logs={logs} isLoading={isLoading} isLoadingMore={isLoadingMore} />
      {logs?.length && !isLoadingMore ? (
        <div className="flex flex-row-reverse py-4 border-gray-200">
          <Waypoint onEnter={() => nextPage()} />
        </div>
      ) : (
        ''
      )}
    </div>
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

export default LogsPage
