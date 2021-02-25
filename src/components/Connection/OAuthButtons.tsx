import React, { memo } from 'react'

import { Button } from 'components'
import { IConnection } from 'types/Connection'
import { authorizationVariablesRequired } from 'utils'
import classNames from 'classnames'

interface IProps {
  connection: IConnection
  isAuthorized: boolean
  authorizeUrl: string
  revokeUrl: string
}

const OAuthButtons = ({ connection, isAuthorized, authorizeUrl, revokeUrl }: IProps) => {
  const requiredAuth = authorizationVariablesRequired(connection)

  return (
    <div className="flex items-center justify-between px-5 py-2 bg-gray-100 border-t rounded-bl-md rounded-br-md">
      {requiredAuth ? (
        <div className={'font-medium text-sm text-gray-500'}>{requiredAuth}</div>
      ) : (
        <div
          className={classNames('uppercase font-medium', {
            'text-primary': isAuthorized,
            'text-gray-500': !isAuthorized
          })}
          style={{ fontSize: '0.8125rem' }}
        >
          {isAuthorized ? 'Connected' : 'Not connected'}
        </div>
      )}

      <div>
        {!requiredAuth ? (
          <Button
            text={isAuthorized ? 'Re-authorize' : 'Authorize'}
            handleClick={() => (window.location.href = authorizeUrl)}
          />
        ) : (
          <Button text={'Authorize'} disabled={true} />
        )}

        {isAuthorized && (
          <div className="inline-block ml-4">
            <Button
              variant="cancel"
              text="Disconnect"
              handleClick={() => (window.location.href = revokeUrl)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(OAuthButtons)
