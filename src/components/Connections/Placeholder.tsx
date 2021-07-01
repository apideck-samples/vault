import { Button, TextInput } from '@apideck/components'
import MenuRightIcon from 'mdi-react/MenuRightIcon'
import { memo } from 'react'

const ConnectionCardLoadingPlaceholder = () => {
  return (
    <div className="flex items-center justify-between w-full px-5 py-4 mt-5 overflow-hidden border rounded-md">
      <div className="flex items-center">
        <div className="mr-5 bg-gray-200 rounded" style={{ width: '36px', height: '36px' }} />
        <div>
          <div
            className="bg-gray-300 rounded skeleton-loading"
            style={{ height: '16px', width: '200px' }}
          />
          <div
            className="mt-1 bg-gray-100 rounded skeleton-loading"
            style={{ height: '14px', width: '240px' }}
          />
        </div>
      </div>
      <div className="flex items-center">
        <div
          className="bg-gray-200 rounded skeleton-loading"
          style={{ height: '14px', width: '70px' }}
        />
        <div className="mx-4 text-gray-500">
          <MenuRightIcon color="currentColor" />
        </div>
      </div>
    </div>
  )
}

const ListPlaceholder = () => {
  return (
    <section>
      <div className="relative mt-6 lg:mt-8">
        <div className="absolute left-0 flex items-center pt-2.5 lg:pt-3 pl-3 pointer-events-none">
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
          className="pl-10 md:py-2.5 lg:py-3 border-gray-50"
          disabled
        />
      </div>
      <div className="flex items-center justify-between mt-8 mb-8 lg:mt-12">
        <div
          className="bg-gray-300 rounded-md skeleton-loading"
          style={{ height: '18px', width: '200px' }}
        />
        <Button
          text="+ Add"
          onClick={() => {
            return false
          }}
          disabled
        />
      </div>
      <ConnectionCardLoadingPlaceholder />
      <ConnectionCardLoadingPlaceholder />
    </section>
  )
}

export default memo(ListPlaceholder)
