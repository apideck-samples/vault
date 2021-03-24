import { Button } from '@apideck/components'
import { Alert } from 'components'
import React, { useState } from 'react'
import { OAuthError } from 'utils'

interface IProps {
  error: OAuthError
}

export const OAuthErrorAlert: React.FC<IProps> = ({ error }) => {
  const [showErrorDetails, setShowErrorDetails] = useState<boolean>(false)

  return (
    <Alert
      title={`${
        error.origin === 'revoke' ? 'Disconnect' : 'Authorization'
      } failed. Please try again.`}
      description={error.message}
    >
      <div className="flex items-center mt-4">
        <Button
          variant="danger"
          className="mr-2"
          onClick={() => {
            location.href = error.ref
          }}
        >
          More Info
        </Button>
        <Button
          variant="danger-outline"
          className="border-none shadow-none hover:shadow-none hover:underline"
          onClick={() => setShowErrorDetails((value) => !value)}
        >
          {showErrorDetails ? 'Hide' : 'Show'} Technical Details
        </Button>
      </div>
      {showErrorDetails && (
        <code>
          <pre className="text-xs mt-4 p-5 bg-red-100 text-red-600 rounded-md">
            {JSON.stringify(error.full, null, 4)}
          </pre>
        </code>
      )}
    </Alert>
  )
}
