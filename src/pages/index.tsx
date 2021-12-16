import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { ConnectionsList, ErrorBlock, ListPlaceholder } from 'components'

import ConnectionsGrid from 'components/Connection/ConnectionsGrid'
import Fuse from 'fuse.js'
import { GlobalHotKeys } from 'react-hotkeys'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import SearchInput from 'components/Inputs/SearchInput'
import SearchedConnectionsList from 'components/Connection/SearchedConnectionsList'
import { SessionExpiredModalContext } from 'utils/context'
import { applySession } from 'next-session'
import client from 'lib/axios'
import { options } from 'utils/sessionOptions'
import useDebounce from 'utils/useDebounce'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { useToast } from '@apideck/components'

const keyMap = { FOCUS_INPUT: ['command+k', 'control+k'] }

interface IProps {
  jwt: string
  token: JWTSession
}

const Home = ({ jwt, token }: IProps): any => {
  const { setSessionExpired } = useContext(SessionExpiredModalContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [list, setList] = useState<IConnection[]>([])
  const [cursor, setCursor] = useState(0)
  const debouncedSearchTerm = useDebounce(searchTerm, 250)
  const [isLoading, setIsLoading] = useState<boolean | string>(false)
  const { push } = useRouter()
  const { addToast } = useToast()
  const searchInputRef: any = useRef()
  let showSuggestions = false
  if (token.settings && 'showSuggestions' in token.settings) {
    showSuggestions = !!token.settings.showSuggestions
  }
  const unifiedApis = token?.settings?.unifiedApis

  const focusInput = useCallback(() => {
    searchInputRef?.current?.focus()
  }, [])

  const handlers = { FOCUS_INPUT: focusInput }

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-APIDECK-APP-ID': token?.applicationId,
        'X-APIDECK-CONSUMER-ID': token?.consumerId
      }
    })
  }

  const { data, error, mutate } = useSWR(`/vault/connections`, fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  })

  let connections: IConnection[] = data?.data?.data
  if (connections?.length && unifiedApis?.length) {
    connections = connections?.filter((connection) => unifiedApis.includes(connection.unified_api))
  }

  const connectionsASC = connections?.sort((a, b) => a.name.localeCompare(b.name))
  const connectionsPerUnifiedApiObj = connectionsASC?.reduce((acc: any, item) => {
    const group = item['unified_api']
    acc[group] = acc[group] || []
    acc[group].push(item)

    return acc
  }, {})
  const addedConnections = connections?.filter((connection) => connection.state !== 'available')
  const isOnBoarded = process.browser && sessionStorage?.getItem('isOnBoarded')
  const noAddedConnections = data && !error && !addedConnections?.length
  const shouldOnBoard = noAddedConnections && !isOnBoarded && showSuggestions

  useEffect(() => {
    if (debouncedSearchTerm) {
      const fuse = new Fuse(connections, {
        keys: ['name', 'unified_api'],
        threshold: 0.4
      })
      const results = fuse.search(debouncedSearchTerm)
      const connectionResults = results.map((result) => result.item)

      setList(connectionResults)
    } else {
      setList(connections)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm])

  useEffect(() => {
    if (shouldOnBoard) {
      push('/suggestions')
    }
  }, [push, shouldOnBoard])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'ArrowUp' && cursor > 0) {
      setCursor(cursor - 1)
    } else if (event.code === 'ArrowDown' && cursor < list.length - 1) {
      setCursor(cursor + 1)
    } else if (event.code === 'Enter') {
      handleClick(list[cursor], cursor)
    }
  }

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
      successCallback()
      mutate()
    } catch (error) {
      errorCallback()

      const { response } = error
      const { status } = response

      if (status === 401) {
        setSessionExpired(true)
      }
    }
  }

  const handleClick = (connection: IConnection, i: number) => {
    if (cursor !== i) setCursor(i)
    if (connection?.state !== 'available') {
      push(`/integrations/${connection.unified_api}/${connection.service_id}`)
      return
    }

    setIsLoading(connection.id)

    const successCallback = () => {
      push(`/integrations/${connection.unified_api}/${connection.service_id}`)
      addToast({
        title: `Integration successfully added`,
        description: `You can now authorize it and manage integration settings.`,
        type: 'success',
        autoClose: true
      })
    }

    const errorCallback = () => {
      setIsLoading(false)
      addToast({
        title: `Something went wrong`,
        description: `The integration has not been added. Please try again.`,
        type: 'error',
        autoClose: true
      })
    }

    createConnection(
      { unifiedApi: connection.unified_api, serviceId: connection.service_id },
      successCallback,
      errorCallback
    )
  }

  if (error) {
    const errorObj = error?.response ? error.response : { status: 400 }
    return <ErrorBlock error={errorObj} token={token} />
  }

  return (
    <GlobalHotKeys handlers={handlers} keyMap={keyMap}>
      <h1 className="text-lg font-medium text-gray-800 md:text-2xl">Manage your integrations</h1>
      {(!data && !error) || shouldOnBoard ? <ListPlaceholder /> : null}
      {connections?.length && !shouldOnBoard ? (
        <>
          <SearchInput
            value={searchTerm}
            handleKeyDown={handleKeyDown}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
            searchInputRef={searchInputRef}
          />
          {noAddedConnections ? (
            <ConnectionsGrid
              connections={list || connections}
              handleClick={handleClick}
              isLoading={isLoading}
              cursor={!!searchTerm?.length && cursor}
            />
          ) : null}
          {!noAddedConnections && searchTerm.length ? (
            <SearchedConnectionsList
              connections={list}
              isLoading={isLoading}
              cursor={cursor}
              handleClick={handleClick}
            />
          ) : null}
          {!noAddedConnections && !searchTerm.length
            ? Object.keys(connectionsPerUnifiedApiObj).map((unifiedApi) => {
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
            : null}
        </>
      ) : null}
      {data && !connections?.length && <div className="mt-12">No integrations available.</div>}
    </GlobalHotKeys>
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
