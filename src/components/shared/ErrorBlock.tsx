import { Button } from '@apideck/components'

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

  const createVaultSession = async () => {
    const response = await fetch('/api/vault/sessions', {
      method: 'POST',
      body: JSON.stringify({
        redirect_uri: window.location.href,
        consumer_metadata: {
          account_name: 'test@salesforce.com',
          user_name: 'Test User',
          image: 'https://unavatar.now.sh/jake'
        }
      })
    })
    return response.json()
  }

  const redirectToSessionRoute = async () => {
    const response = await createVaultSession()
    const url = response?.data?.session_uri
    if (!url) {
      console.log('Creating session failed:', response)
      return
    }
    const token = url.substring(url.lastIndexOf('/') + 1)
    window.location.href = `${window.location.origin}/session/${token}`
  }

  return (
    <div className="flex items-center justify-center flex-1 w-full">
      <div className="flex flex-col items-center">
        <h1 className="mb-4 text-2xl font-medium text-gray-800">{errorTitle}</h1>
        <ErrorMessage redirectUri={redirectUri} message={errorMessage} />
        {process.env.NODE_ENV !== 'production' && (
          <div className="max-w-xs p-4 mt-4 overflow-x-auto text-sm border rounded sm:max-w-sm md:max-w-md lg:max-w-2xl">
            <div className="flex justify-between">
              <h2 className="mb-2 font-medium">DEVELOPMENT ONLY</h2>
              {status === 401 && (
                <Button
                  text="Create session"
                  variant="outline"
                  onClick={() => redirectToSessionRoute()}
                  className="mb-2"
                />
              )}
            </div>
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
