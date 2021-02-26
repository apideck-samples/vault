import { Fragment, memo } from 'react'

const Placeholder = () => {
  return (
    <Fragment>
      <div className="mt-2 border rounded-md">
        <div className="px-5 py-4">
          <div
            className="skeleton-loading bg-gray-100 rounded mt-1"
            style={{ height: '16px', width: '240px' }}
          ></div>
        </div>

        <div className="px-5 py-6 border-t border-b">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center justify-center">
              <div
                className="bg-gray-100 rounded mt-1"
                style={{ height: '14px', width: '240px' }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <div className="bg-gray-200 rounded m-2 mr-5" style={{ height: '36px', width: '80px' }} />
        </div>
      </div>
    </Fragment>
  )
}

export default memo(Placeholder)
