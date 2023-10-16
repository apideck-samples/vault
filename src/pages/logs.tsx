import { AxiosResponse } from 'axios'
import LogsTable from 'components/Logs/LogsTable'
import ErrorBlock from 'components/shared/ErrorBlock'
import client from 'lib/axios'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Waypoint } from 'react-waypoint'
import useSWRInfinite from 'swr/infinite'
import { useSession } from 'utils/useSession'

const LogsPage = () => {
  const { session } = useSession()
  const { push } = useRouter()

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${session?.jwt}`,
        'X-APIDECK-APP-ID': `${session?.applicationId}`,
        'X-APIDECK-CONSUMER-ID': `${session?.consumerId}`
      }
    })
  }

  const getKey = (pageIndex: number, previousPage: any) => {
    if (previousPage && !previousPage?.data?.data?.length) return null
    if (pageIndex === 0) return `/vault/logs?filter[exclude_unified_apis]=vault`
    const cursor = previousPage?.data?.meta?.cursors?.next
    return `/vault/logs?filter[exclude_unified_apis]=vault&cursor=${cursor}`
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

  useEffect(() => {
    if (session?.settings && 'showLogs' in session?.settings && !session?.settings?.showLogs) {
      push('/')
    }
  }, [push, session?.settings])

  if (error) {
    return <ErrorBlock error={error?.response} token={session} />
  }

  const isLoading = !data && !error
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined'
  const logs = data?.map((page: AxiosResponse) => page?.data?.data).flat() || []
  return (
    <div>
      <h1 className="mb-4 text-lg font-medium text-gray-800 md:mb-6 lg:mb-8 md:text-2xl">Logs</h1>
      {!logs?.length && !isLoading ? <p>No logs found</p> : ''}
      {logs?.length || isLoading ? (
        <LogsTable logs={logs} isLoading={isLoading} isLoadingMore={isLoadingMore} />
      ) : (
        ''
      )}
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

export default LogsPage
