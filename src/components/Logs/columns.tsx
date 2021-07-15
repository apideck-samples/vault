import ImgWithFallback from 'components/shared/ImgWithFallback'
import classNames from 'classnames'

export const columns: any[] = [
  {
    Header: 'Service',
    accessor: 'service.id',
    // eslint-disable-next-line react/display-name
    Cell: ({ value }: { value: string }) => <Service serviceId={value} />
  },
  {
    Header: 'Method',
    accessor: 'http_method'
  },
  {
    Header: 'Status',
    accessor: 'status_code',
    // eslint-disable-next-line react/display-name
    Cell: ({ value, row }: { value: string; row: any }) => (
      <Status statusCode={value} success={row?.original?.success} />
    )
  },
  {
    Header: 'Path',
    accessor: 'path'
  },
  {
    Header: 'Date',
    accessor: 'timestamp',
    // eslint-disable-next-line react/display-name
    Cell: ({ value }: { value: string }) => <Timestamp value={value} />
  }
]

const Service = ({ serviceId }: { serviceId: string }) => {
  const iconName = serviceId === 'vault' ? 'apideck' : serviceId

  return (
    <ImgWithFallback
      src={`https://res.cloudinary.com/apideck/icons/${
        iconName === 'close' ? 'closeio' : iconName
      }`}
      className="block w-8 h-8 text-gray-900 rounded"
      alt={serviceId}
      fallbackSrc={`https://via.placeholder.com/100?text=?`}
    />
  )
}

const Timestamp = ({ value }: { value: string }) => {
  return (
    <div>
      <span className="mr-2 text-gray-900">{new Date(value).toLocaleDateString()}</span>
      <span className="text-gray-500 ">{new Date(value).toLocaleTimeString()}</span>
    </div>
  )
}

const Status = ({ statusCode, success }: any) => {
  return (
    <span
      className={classNames(
        'inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full',
        {
          'text-green-800 bg-green-100': success,
          'text-red-800 bg-red-100': !success
        }
      )}
    >
      {statusCode}
    </span>
  )
}
