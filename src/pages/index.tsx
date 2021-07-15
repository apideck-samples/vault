import { TextInput, useToast } from '@apideck/components'
import { ConnectionCard, ConnectionsList, ErrorBlock, ListPlaceholder } from 'components'
import client from 'lib/axios'
import { applySession } from 'next-session'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { GlobalHotKeys } from 'react-hotkeys'
import useSWR from 'swr'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { SessionExpiredModalContext } from 'utils/context'
import { options } from 'utils/sessionOptions'
import useDebounce from 'utils/useDebounce'

const keyMap = { FOCUS_INPUT: ['command+k', 'control+k'] }
const ACTION_KEY_DEFAULT = ['Ctrl ', 'Control']
const ACTION_KEY_APPLE = ['⌘', 'Command']

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
  const [browserDetected, setBrowserDetected] = useState(false)
  const [actionKey, setActionKey] = useState(ACTION_KEY_DEFAULT)
  const { push } = useRouter()
  const { addToast } = useToast()
  const ref: any = useRef()

  const focusInput = useCallback(() => {
    ref?.current?.focus()
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

  useEffect(() => {
    if (debouncedSearchTerm) {
      const results = connections.filter((connector: IConnection) =>
        connector.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
      setList(results)
    } else {
      setList(connections)
    }
  }, [connections, debouncedSearchTerm])

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
        setActionKey(ACTION_KEY_APPLE)
      } else {
        setActionKey(ACTION_KEY_DEFAULT)
      }
      setBrowserDetected(true)
    }
  }, [])

  useEffect(() => {
    if (!data || error) return

    const addedConnections = connections?.filter((connection) => connection.state !== 'available')
    const isOnBoarded = sessionStorage.getItem('isOnBoarded')
    if (!addedConnections?.length && !isOnBoarded) {
      push('/suggestions')
      sessionStorage.setItem('isOnBoarded', 'true')
    }
  }, [connections, data, error, push])

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

  const handleClick = (connection: IConnection, i: number) => {
    if (cursor !== i) setCursor(i)
    if (connection?.state !== 'available') {
      push(`/integrations/${connection.unified_api}/${connection.service_id}`)
      return
    }

    setIsLoading(connection.id)

    const successCallback = () => {
      setIsLoading(false)
      addToast({
        title: `Integration successfully added`,
        description: `You can now authorize it and manage integration settings.`,
        type: 'success',
        autoClose: true
      })
      push(`/integrations/${connection.unified_api}/${connection.service_id}`)
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
      {!data && !error && <ListPlaceholder />}
      {connections?.length && (
        <>
          <div className="relative mt-6 lg:mt-8">
            <div className="absolute left-0 flex items-center pt-2.5 md:pt-3 pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <TextInput
              name="search"
              type="text"
              ref={ref}
              placeholder="Search integrations"
              value={searchTerm}
              className="pl-10 md:py-2.5 lg:py-3 border-gray-50"
              autoComplete="off"
              onKeyDown={handleKeyDown}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
            />
            <span
              style={{ opacity: browserDetected ? '1' : '0' }}
              className="hidden whitespace-nowrap sm:block ml-2 md:ml-4 text-gray-400 text-sm py-0.5 px-1.5 border border-gray-300 rounded-md absolute right-2.5 top-2.5"
            >
              <span className="mr-1 font-medium">{actionKey[0]}</span>K
            </span>
          </div>
          {searchTerm.length ? (
            <div className="mt-6">
              {list?.map((connection: IConnection, i) => {
                const { id, unified_api, service_id, state } = connection

                if (state !== 'available') {
                  return (
                    <Link href={`/integrations/${unified_api}/${service_id}`} key={id}>
                      <a>
                        <ConnectionCard connection={connection} isActive={cursor === i} />
                      </a>
                    </Link>
                  )
                } else {
                  return (
                    <button onClick={() => handleClick(connection, i)} key={id} className="w-full">
                      <ConnectionCard
                        connection={connection}
                        isLoading={isLoading === connection.id}
                        isActive={cursor === i}
                      />
                    </button>
                  )
                }
              })}
            </div>
          ) : (
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
            })
          )}
        </>
      )}
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
