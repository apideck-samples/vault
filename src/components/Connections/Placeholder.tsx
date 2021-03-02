import { Button } from 'components'
import MenuRightIcon from 'mdi-react/MenuRightIcon'
import { memo } from 'react'

const ConnectionCardLoadingPlaceholder = () => {
  return (
    <div className="w-full mt-5 border rounded-md py-4 px-5 flex items-center justify-between">
      <div className="flex items-center">
        <div className="mr-5 rounded bg-gray-200" style={{ width: '36px', height: '36px' }} />
        <div>
          <div
            className="skeleton-loading bg-gray-300 rounded"
            style={{ height: '16px', width: '200px' }}
          />
          <div
            className="skeleton-loading bg-gray-100 rounded mt-1"
            style={{ height: '14px', width: '240px' }}
          />
        </div>
      </div>
      <div className="flex items-center">
        <div
          className="skeleton-loading bg-gray-200 rounded"
          style={{ height: '14px', width: '70px' }}
        />
        <div className="text-gray-500 mx-4">
          <MenuRightIcon color="currentColor" />
        </div>
      </div>
    </div>
  )
}

const ListPlaceholder = () => {
  return (
    <section className="mt-12">
      <div className="flex justify-between items-center mb-8">
        <div
          className="skeleton-loading bg-gray-300 rounded-md"
          style={{ height: '18px', width: '200px' }}
        />
        <Button
          text="+ Add"
          handleClick={() => {
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
