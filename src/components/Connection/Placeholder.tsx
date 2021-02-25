import { Fragment, memo } from 'react'

const Placeholder = () => {
  return (
    <Fragment>
      <div className="bg-gray-100 rounded-md mb-4" style={{ height: '24px', width: '120px' }} />
      <div className="skeleton-loading border rounded-md">
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center justify-start">
            <div className="mr-5 rounded bg-gray-200" style={{ width: '40px', height: '40px' }} />
            <div>
              <div className="bg-gray-300 rounded" style={{ height: '16px', width: '200px' }} />
              <div
                className="bg-gray-100 rounded mt-1"
                style={{ height: '14px', width: '240px' }}
              />
            </div>
          </div>
          <div className="bg-gray-300 rounded" style={{ height: '36px', width: '100px' }} />
        </div>
      </div>
      <div className="skeleton-loading mt-10 border rounded-md py-4 px-5">
        <div className="bg-gray-200 rounded mb-2" style={{ height: '16px', width: '120px' }} />
        <div className="bg-gray-100 rounded mb-1" style={{ height: '14px', width: '360px' }} />
        <div className="bg-gray-100 rounded" style={{ height: '14px', width: '140px' }} />
      </div>
    </Fragment>
  )
}

export default memo(Placeholder)
