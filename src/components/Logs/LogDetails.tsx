import { ILog } from 'types/Log'
import ImgWithFallback from 'components/shared/ImgWithFallback'

const httpColors: { [key: string]: string } = {
  GET: '#006BE6',
  POST: '#178387',
  PUT: '#CC4B00',
  PATCH: '#CC4B00',
  DELETE: '#DC2626'
}

interface IProps {
  log: ILog
}

const LogDetails = ({ log }: IProps) => {
  const {
    http_method: httpMethod,
    base_url: baseUrl,
    path,
    operation,
    api_style: apiStyle,
    unified_api: unifiedApi,
    duration,
    id,
    service,
    latency,
    timestamp,
    error_message: errorMessage,
    status_code: statusCode
  } = log

  const formatToMsString = (int: number) => `${Math.round(int)} ms`
  const durationString = duration ? formatToMsString(duration) : '-'
  const latencyString = latency ? formatToMsString(latency) : '-'
  const unifiedApiFormatted = unifiedApi.charAt(0).toUpperCase() + unifiedApi.slice(1).toLowerCase()
  const iconName = service?.id === 'vault' ? 'apideck' : service?.id

  return (
    <div className="-m-5 overflow-hidden bg-white sm:rounded-lg">
      <div className="flex items-center justify-between px-4 py-5 sm:px-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">{operation.name}</h3>
          <p className="max-w-2xl mt-1 text-sm text-gray-500">
            <span style={{ color: httpColors[httpMethod] }} className="mr-2 font-medium uppercase">
              {httpMethod}
            </span>
            <span className="text-gray-700 dark:text-gray-400">{`${baseUrl}${path}`}</span>
          </p>
        </div>
        {iconName ? (
          <ImgWithFallback
            src={`https://res.cloudinary.com/apideck/icons/${
              iconName === 'close' ? 'closeio' : iconName
            }`}
            className="block w-8 h-8 text-gray-900 rounded"
            alt={service.id}
            loading="lazy"
            fallbackSrc={`https://via.placeholder.com/100?text=?`}
          />
        ) : (
          ''
        )}
      </div>
      <div className="px-4 py-5 border-t border-gray-200 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          {service?.id ? (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Service</dt>
              <dd className="mt-1 text-sm text-gray-900">{service?.name}</dd>
            </div>
          ) : (
            ''
          )}
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">API</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {operation?.id === 'ProxyCall' || operation?.id === 'PROXY REQUEST'
                ? 'Proxy'
                : unifiedApiFormatted}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Status code</dt>
            <dd className="mt-1 text-sm text-gray-900">{statusCode}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div>
                <span className="mr-2 text-gray-900">
                  {new Date(timestamp).toLocaleDateString()}
                </span>
                <span className="text-gray-500 ">{new Date(timestamp).toLocaleTimeString()}</span>
              </div>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Duration</dt>
            <dd className="mt-1 text-sm text-gray-900">{durationString}</dd>
          </div>
          {latency > 0.9 ? (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Latency</dt>
              <dd className="mt-1 text-sm text-gray-900">{latencyString}</dd>
            </div>
          ) : (
            ''
          )}
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">API Style</dt>
            <dd className="mt-1 text-sm text-gray-900">{apiStyle}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Request ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{id}</dd>
          </div>
          {errorMessage ? (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Error message</dt>
              <dd className="mt-1 text-sm text-gray-900">{errorMessage}</dd>
            </div>
          ) : (
            ''
          )}
        </dl>
      </div>
    </div>
  )
}

export default LogDetails
