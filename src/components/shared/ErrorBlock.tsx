interface IMessageProps {
  redirectUri?: string
  message: string
}

interface IErrorProps {
  error: { status: number }
  token?: {
    exp?: number
    redirectUri?: string
  }
}

const ErrorMessage = ({ redirectUri, message }: IMessageProps) => {
  if (redirectUri) {
    return (
      <div>
        Please{' '}
        <a
          href={redirectUri}
          className="border-b border-gray-500 border-dashed hover:border-gray-800"
        >
          return to the application
        </a>{' '}
        and try again.
      </div>
    )
  }
  return <div>{message}</div>
}

const ErrorBlock = ({ error, token = {} }: IErrorProps) => {
  const status = error?.status || 500
  const exp = token?.exp
  const redirectUri = token?.redirectUri

  let errorTitle = 'Something went wrong.'
  let errorMessage = 'Something went wrong loading the page. Please try again later.'

  if (status === 401) {
    const nowString = new Date().getTime().toString()
    const now = parseInt(nowString.substring(0, nowString.length - 3))

    if (exp && now > exp) {
      errorTitle = 'Your session has expired.'
      errorMessage = 'Please return to application and start a new session.'
    } else {
      errorTitle = 'Your session is invalid.'
      errorMessage = 'Please return to application and start a new session.'
    }
  } else if (status === 404) {
    errorTitle = 'Error 404'
    errorMessage = 'This page was not found.'
  }

  return (
    <div className="flex items-center justify-center flex-1 w-full">
      <div className="flex flex-col items-center">
        <h1 className="mb-4 text-2xl font-medium text-gray-800">{errorTitle}</h1>
        <ErrorMessage redirectUri={redirectUri} message={errorMessage} />
        {process.env.NODE_ENV !== 'production' && (
          <div className="p-4 mt-4 text-sm border rounded">
            <h2 className="mb-2 font-medium">DEVELOPMENT ONLY</h2>
            <code className="text-sm">
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </code>
          </div>
        )}
      </div>
    </div>
  )
}

export default ErrorBlock
