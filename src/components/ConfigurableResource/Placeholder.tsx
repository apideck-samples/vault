import React, { memo } from 'react'

const Placeholder = () => {
  return (
    <div data-testid="resourcePlaceholder">
      <div className="inline-flex items-center self-start justify-start mb-4 text-sm leading-none">
        <div className="mr-1 bg-gray-200 rounded-md" style={{ height: '18px', width: '18px' }} />

        <div
          className="bg-gray-200 rounded-md skeleton-loading"
          style={{ height: '18px', width: '200px' }}
        />
      </div>

      <div className="mt-4 overflow-hidden border rounded-md">
        <div className="px-5 py-4">
          <div
            className="mt-1 bg-gray-200 rounded skeleton-loading "
            style={{ height: '18px', width: '240px' }}
          ></div>
        </div>

        <div className="px-5 py-6 overflow-hidden border-t border-b">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-start mb-3">
              <div
                className="mt-1 mr-4 bg-gray-200 rounded"
                style={{ height: '18px', width: '160px' }}
              />
              <div className="mt-1 border rounded" style={{ height: '33px', width: '275px' }} />
            </div>

            <div className="flex items-center justify-start mb-3">
              <div
                className="mt-1 mr-4 bg-gray-200 rounded"
                style={{ height: '18px', width: '160px' }}
              />
              <div className="mt-1 border rounded" style={{ height: '33px', width: '275px' }} />
            </div>

            <div className="flex items-center justify-start mb-3">
              <div
                className="mt-1 mr-4 bg-gray-200 rounded"
                style={{ height: '18px', width: '160px' }}
              />
              <div className="mt-1 border rounded" style={{ height: '33px', width: '275px' }} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end overflow-hidden">
          <div className="m-2 mr-5 bg-gray-200 rounded" style={{ height: '36px', width: '80px' }} />
        </div>
      </div>
    </div>
  )
}

export default memo(Placeholder)
