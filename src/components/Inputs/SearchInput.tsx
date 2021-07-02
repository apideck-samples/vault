import { Button, TextInput, useOutsideClick, useToast } from '@apideck/components'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import MenuRightIcon from 'mdi-react/MenuRightIcon'
import { useRouter } from 'next/router'
import React, { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
import { IConnection } from 'types/Connection'
import useDebounce from 'utils/useDebounce'

interface IProps {
  connections: IConnection[]
  createConnection: (
    data: { unifiedApi: string; serviceId: string },
    successCallback: () => void,
    ErrorCallback: () => void
  ) => void
}

const SearchInput = ({ connections, createConnection }: IProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [list, setList] = useState(connections)
  const [cursor, setCursor] = useState(0)
  const debouncedSearchTerm = useDebounce(searchTerm, 250)
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { push } = useRouter()
  const { addToast } = useToast()
  const ref: any = useRef()

  useOutsideClick(ref, () => setIsFocused(false))

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

  const handleKeyDown = (e: KeyboardEvent) => {
    // arrow up/down button should select next/previous list element
    if (e.code === 'ArrowUp' && cursor > 0) {
      setCursor(cursor - 1)
      ref?.current?.scrollTo(cursor * 80 - 80, cursor * 80 - 80)
    } else if (e.code === 'ArrowDown' && cursor < list.length - 1) {
      setCursor(cursor + 1)
      ref?.current?.scrollTo(0, cursor * 80 - 80)
    } else if (e.code === 'Enter') {
      handleClick(list[cursor], cursor)
    }
  }

  const handleClick = (connection: IConnection, i: number) => {
    if (cursor !== i) setCursor(i)
    if (connection.state !== 'available') {
      push(`/integrations/${connection.unified_api}/${connection.service_id}`)
      return
    }

    setIsLoading(true)

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
        description: `The integration has nog been added. Please try again.`,
        type: 'success',
        autoClose: true
      })
    }

    createConnection(
      { unifiedApi: connection.unified_api, serviceId: connection.service_id },
      successCallback,
      errorCallback
    )
  }

  return (
    <div className="relative mt-6 lg:mt-8">
      <div className="absolute left-0 flex items-center pt-2.5 pl-3 pointer-events-none">
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
        placeholder="Search integrations"
        value={searchTerm}
        className="pl-10 sm:max-w-sm lg:max-w-sm xl:max-w-md"
        autocomplete="off"
        onKeyDown={handleKeyDown}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value)}
        onFocus={() => setIsFocused(true)}
      />
      <Transition
        show={isFocused}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-90"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0"
      >
        <ul
          className="absolute left-0 w-full p-4 mt-3 overflow-auto bg-white rounded-md shadow-lg sm:max-w-sm lg:max-w-sm xl:max-w-md md:mt-4 ring-1 ring-black ring-opacity-5"
          style={{ maxHeight: 480 }}
          ref={ref}
        >
          {!list?.length && (
            <p className="flex items-center justify-center h-full">No connections available</p>
          )}
          {list?.map((connection: IConnection, i: number) => {
            const delay = Math.max(0, i * 20 + 100)
            return (
              <Transition
                show={isFocused}
                style={{ transitionDelay: `${delay}ms` }}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-90"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0"
                key={`${i}-${connection.name}`}
              >
                <SearchItem
                  connection={connection}
                  handleClick={() => handleClick(connection, i)}
                  isActive={cursor === i}
                  isLoading={isLoading && cursor === i}
                />
              </Transition>
            )
          })}
        </ul>
      </Transition>
    </div>
  )
}

interface IItemProps {
  connection: IConnection
  handleClick: (connection: IConnection) => void
  isLoading?: boolean
  isActive?: boolean
}

const SearchItem = ({ connection, isActive, isLoading = false, handleClick }: IItemProps) => {
  return (
    <li
      className={classNames(
        'flex items-center justify-between w-full px-3 md:px-4 py-2 md:py-3 mt-3 overflow-hidden rounded-md group hover:bg-gray-100 cursor-pointer',
        { 'bg-purple-100': isLoading, 'bg-gray-100': isActive }
      )}
      onClick={() => handleClick(connection)}
    >
      <div className="flex items-center">
        <img
          className="w-8 h-8 mr-4 rounded md:mr-5 md:h-10 md:w-10"
          src={connection.icon}
          alt={connection.name}
        />
        <div className="text-left">
          <div className="text-sm font-medium md:text-md spec-connection-name">
            {connection.name}
          </div>
          <div className="text-xs text-gray-600 sm:text-sm">
            {connection.unified_api?.toUpperCase()} API
          </div>
        </div>
      </div>
      <div className="flex items-center text-gray-400">
        {connection.state !== 'available' ? (
          <MenuRightIcon color="currentColor" />
        ) : (
          <Button text={isLoading ? 'Add' : '+ Add'} variant="primary" isLoading={isLoading} />
        )}
      </div>
    </li>
  )
}

export default SearchInput
