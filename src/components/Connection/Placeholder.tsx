import { Fragment, memo } from 'react'

const Placeholder = () => {
  return (
    <Fragment>
      <div
        className="mb-4 overflow-hidden bg-gray-100 rounded-md"
        style={{ height: '24px', width: '120px' }}
      />
      <div className="border rounded-md skeleton-loading">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center justify-start">
            <div className="mr-5 bg-gray-200 rounded" style={{ width: '40px', height: '40px' }} />
            <div>
              <div className="bg-gray-300 rounded" style={{ height: '16px', width: '200px' }} />
              <div
                className="mt-1 bg-gray-100 rounded"
                style={{ height: '14px', width: '240px' }}
              />
            </div>
          </div>
          <div className="bg-gray-300 rounded" style={{ height: '36px', width: '100px' }} />
        </div>
      </div>
      <div className="px-5 py-4 mt-10 border rounded-md skeleton-loading">
        <div className="mb-2 bg-gray-200 rounded" style={{ height: '16px', width: '120px' }} />
        <div className="mb-1 bg-gray-100 rounded" style={{ height: '14px', width: '360px' }} />
        <div className="bg-gray-100 rounded" style={{ height: '14px', width: '140px' }} />
      </div>
    </Fragment>
  )
}

export default memo(Placeholder)
