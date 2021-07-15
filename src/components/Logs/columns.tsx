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
    Cell: ({ value }: { value: number }) => <Status statusCode={value} />
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

const Status = ({ statusCode }: { statusCode: number }) => {
  const code = statusCode.toString()
  return (
    <span
      className={classNames('inline-flex px-2 text-xs font-semibold leading-5 rounded-full', {
        'text-green-800 bg-green-100': code?.charAt(0) !== '4' && code?.charAt(0) !== '5',
        'text-yellow-800 bg-yellow-100': code?.charAt(0) === '4',
        'text-red-800 bg-red-100': code?.charAt(0) === '5'
      })}
    >
      {statusCode}
    </span>
  )
}
