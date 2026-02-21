import { FaCircle, FaExclamationTriangle } from 'react-icons/fa'

import { FC } from 'react'
import { IConnection } from 'types/Connection'

interface IProps {
  connection: IConnection
  showConfig?: boolean
}

export const ConnectionBadge: FC<IProps> = ({
  connection: { enabled, state, consent_state },
  showConfig = true
}) => {
  // Check for consent states first
  if (consent_state === 'pending' || consent_state === 'requires_reconsent') {
    return (
      <div className="flex items-center px-2 py-1 text-xs font-medium leading-none rounded-full bg-warning-lighter text-warning">
        <span className="mr-1.5">
          <FaExclamationTriangle />
        </span>
        <span className="inline-block">Consent required</span>
      </div>
    )
  }

  if (consent_state === 'denied' || consent_state === 'revoked') {
    return (
      <div className="flex items-center px-2 py-1 text-xs font-medium leading-none rounded-full bg-red-100 text-red-600">
        <span className="mr-1.5">
          <FaExclamationTriangle />
        </span>
        <span className="inline-block">Consent denied</span>
      </div>
    )
  }

  if (!enabled) {
    return (
      <div className="flex items-center px-2 py-1 text-xs font-medium leading-none text-gray-500 bg-gray-100 rounded-full">
        <span className="flex flex-col justify-center mr-2">
          <FaCircle size={8} />
        </span>
        Disabled
      </div>
    )
  }

  if (state === 'callable') {
    return (
      <div className="flex items-center px-2 py-1 text-xs font-medium leading-none rounded-full text-primary-600 bg-primary-100">
        <span className="flex flex-col justify-center mr-2">
          <FaCircle size={8} />
        </span>
        Enabled
      </div>
    )
  }

  if (state === 'invalid') {
    return (
      <div className="flex items-center px-2 py-1 text-xs font-medium leading-none rounded-full bg-warning-lighter text-warning">
        <span className="mr-1.5">
          <FaExclamationTriangle />
        </span>
        <span className="inline-block">Invalid configuration</span>
      </div>
    )
  }

  if (showConfig) {
    return (
      <div className="flex items-center px-2 py-1 text-xs font-medium leading-none rounded-full bg-warning-lighter text-warning">
        <span className="mr-1.5">
          <FaExclamationTriangle />
        </span>
        <span className="inline-block">Needs configuration</span>
      </div>
    )
  }

  return null
}
