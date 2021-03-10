import { Button } from '@apideck/components'
import classNames from 'classnames'
import React, { memo, useContext } from 'react'
import { IConnection } from 'types/Connection'
import { authorizationVariablesRequired, ThemeContext, ThemeContextType } from 'utils'

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
            onClick={() => (window.location.href = authorizeUrl)}
            style={primary_color ? { backgroundColor: primary_color } : {}}
          />
        ) : (
          <Button
            text="Authorize"
            isDisabled={true}
            style={primary_color ? { backgroundColor: primary_color } : {}}
          />
        )}

        {isAuthorized && (
          <div className="inline-block ml-4">
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
