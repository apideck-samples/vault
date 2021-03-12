import { Button } from '@apideck/components'
import MenuRightIcon from 'mdi-react/MenuRightIcon'
import { memo } from 'react'

const ConnectionCardLoadingPlaceholder = () => {
  return (
    <div className="flex items-center justify-between w-full px-5 py-4 mt-5 border rounded-md">
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
    <section className="mt-12">
      <div className="flex items-center justify-between mb-8">
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
