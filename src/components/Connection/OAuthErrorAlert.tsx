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
        error.details.origin === 'revoke' ? 'Disconnect' : 'Authorization'
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
        <div className="text-xs mt-4 p-4 bg-red-100 text-red-600 rounded-md">
          <p className="font-medium text-sm">{error.details.error_type}</p>
          <p className="mt-2">{error.details.error_message}</p>
          <p className="mt-2">
            <span className="font-medium">origin:</span> {error.details.origin}{' '}
            {error.details.service_id && (
              <span>
                <span className="font-medium ml-1">service_id:</span> {error.details.service_id}
              </span>
            )}
            {error.details.application_id && (
              <span>
                <span className="font-medium ml-1">application_id:</span>{' '}
                {error.details.application_id}
              </span>
            )}
            {error.details.client_id && (
              <span>
                <span className="font-medium ml-1">client_id:</span> {error.details.client_id}
              </span>
            )}
          </p>
        </div>
      )}
    </Alert>
  )
}
