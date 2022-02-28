import { ChangeEvent, KeyboardEventHandler, RefObject, useEffect, useState } from 'react'

import { TextInput } from '@apideck/components'

const ACTION_KEY_DEFAULT = ['Ctrl ', 'Control']
const ACTION_KEY_APPLE = ['⌘', 'Command']

interface Props {
  value: string
  searchInputRef: RefObject<HTMLInputElement>
  handleKeyDown: KeyboardEventHandler<HTMLInputElement>
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

const SearchInput = ({ value, searchInputRef, handleKeyDown, onChange }: Props) => {
  const [browserDetected, setBrowserDetected] = useState(false)
  const [actionKey, setActionKey] = useState(ACTION_KEY_DEFAULT)

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

  return (
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
        ref={searchInputRef}
        placeholder="Search integrations"
        value={value}
        className="pl-10 md:py-2.5 lg:py-3"
        autoComplete="off"
        onKeyDown={handleKeyDown}
        onChange={onChange}
      />
      <span
        style={{ opacity: browserDetected ? '1' : '0' }}
        className="hidden whitespace-nowrap sm:block ml-2 md:ml-4 text-gray-400 text-sm py-0.5 px-1.5 border border-gray-300 rounded-md absolute right-2.5 top-2.5"
      >
        <span className="mr-1 font-medium">{actionKey[0]}</span>K
      </span>
    </div>
  )
}

export default SearchInput
