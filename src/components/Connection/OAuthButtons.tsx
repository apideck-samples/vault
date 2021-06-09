import React, { memo, useContext } from 'react'
import { ThemeContext, ThemeContextType, authorizationVariablesRequired } from 'utils'

import { Button } from '@apideck/components'
import { IConnection } from 'types/Connection'
import classNames from 'classnames'

interface IProps {
  connection: IConnection
  isAuthorized: boolean
  authorizeUrl: string
  revokeUrl: string
}

const OAuthButtons = ({ connection, isAuthorized, authorizeUrl, revokeUrl }: IProps) => {
  const requiredAuth = authorizationVariablesRequired(connection)
  const { primary_color } = useContext(ThemeContext) as ThemeContextType

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-t sm:px-4 md:px-5 rounded-bl-md rounded-br-md">
      {requiredAuth ? (
        <div className={'font-medium text-xs sm:text-sm text-gray-500'}>{requiredAuth}</div>
      ) : (
        <div
          className={classNames('uppercase font-medium text-xs sm:text-sm pr-2', {
            'text-main': isAuthorized,
            'text-gray-500': !isAuthorized
          })}
        >
          {isAuthorized ? 'Connected' : 'Not connected'}
        </div>
      )}

      <div>
        {!requiredAuth ? (
          <Button
            text={isAuthorized ? 'Re-authorize' : 'Authorize'}
            onClick={() => (window.location.href = authorizeUrl)}
            style={primary_color ? { backgroundColor: primary_color } : {}}
          />
        ) : (
          <Button
            text="Authorize"
            disabled={true}
            style={primary_color ? { backgroundColor: primary_color } : {}}
          />
        )}

        {isAuthorized && (
          <div className="inline-block ml-2 md:ml-4">
            <Button
              variant="outline"
              text="Disconnect"
              onClick={() => (window.location.href = revokeUrl)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(OAuthButtons)
