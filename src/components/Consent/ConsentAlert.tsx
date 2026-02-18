import { FC } from 'react'
import { Alert } from '@apideck/components'
import Link from 'next/link'
import { IConnection } from 'types/Connection'

interface ConsentAlertProps {
  connection: IConnection
}

export const ConsentAlert: FC<ConsentAlertProps> = ({ connection }) => {
  const { consent_state, unified_api, service_id } = connection

  if (consent_state === 'requires_reconsent') {
    return (
      <Alert
        className="text-left mb-4"
        variant="warning"
        title="Consent required"
        description={
          <span>
            This integration requires your consent to access updated data fields.{' '}
            <Link
              href={`/integrations/${unified_api}/${service_id}/consent`}
              className="underline hover:opacity-80 font-semibold"
            >
              Review and grant consent
            </Link>{' '}
            to continue using this integration.
          </span>
        }
      />
    )
  }

  if (consent_state === 'denied') {
    return (
      <Alert
        className="text-left mb-4"
        variant="danger"
        title="Consent denied"
        description="You have denied consent for this integration. Grant consent to use this integration."
      />
    )
  }

  if (consent_state === 'revoked') {
    return (
      <Alert
        className="text-left mb-4"
        variant="warning"
        title="Consent revoked"
        description={
          <span>
            Your consent has been revoked.{' '}
            <Link
              href={`/integrations/${unified_api}/${service_id}/consent`}
              className="underline hover:opacity-80 font-semibold"
            >
              Grant consent again
            </Link>{' '}
            to continue using this integration.
          </span>
        }
      />
    )
  }

  return null
}
