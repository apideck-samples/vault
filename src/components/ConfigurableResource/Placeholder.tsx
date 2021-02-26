import React, { Fragment, memo } from 'react'

const Placeholder = () => {
  return (
    <Fragment>
      <div className="inline-flex items-center self-start justify-start mb-4 text-sm leading-none">
        <div className="bg-gray-200 mr-1 rounded-md" style={{ height: '18px', width: '18px' }} />

        <div
          className="bg-gray-200 skeleton-loading rounded-md"
          style={{ height: '18px', width: '200px' }}
        />
      </div>

      <div className="mt-4 border rounded-md">
        <div className="px-5 py-4">
          <div
            className="skeleton-loading bg-gray-200 rounded mt-1"
            style={{ height: '18px', width: '240px' }}
          ></div>
        </div>

        <div className="px-5 py-6 border-t border-b">
          <div className="items-center justify-center flex flex-col">
            <div className="flex items-center justify-start mb-3">
              <div
                className="bg-gray-200 rounded mt-1 mr-4"
                style={{ height: '18px', width: '160px' }}
              />
              <div className="border rounded mt-1" style={{ height: '33px', width: '275px' }} />
            </div>

            <div className="flex items-center justify-start mb-3">
              <div
                className="bg-gray-200 rounded mt-1 mr-4"
                style={{ height: '18px', width: '160px' }}
              />
              <div className="border rounded mt-1" style={{ height: '33px', width: '275px' }} />
            </div>

            <div className="flex items-center justify-start mb-3">
              <div
                className="bg-gray-200 rounded mt-1 mr-4"
                style={{ height: '18px', width: '160px' }}
              />
              <div className="border rounded mt-1" style={{ height: '33px', width: '275px' }} />
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
