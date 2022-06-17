import { ThemeContext, authorizationVariablesRequired } from 'utils'
import { memo, useContext } from 'react'

import { Button } from '@apideck/components'
import { IConnection } from 'types/Connection'
import { Theme } from 'types/JWTSession'
import classNames from 'classnames'

interface IProps {
  connection: IConnection
  isAuthorized: boolean
  isLoading: boolean
  revokeUrl: string
  onAuthorize: () => void
}

const OAuthButtons = ({ connection, isAuthorized, isLoading, revokeUrl, onAuthorize }: IProps) => {
  const requiredAuth = authorizationVariablesRequired(connection)
  const { primaryColor } = useContext(ThemeContext) as Theme

  const renderButton = () => {
    if (connection.service_id === 'google-drive') {
      return (
        <button
          onClick={onAuthorize}
          disabled={!!requiredAuth || isLoading}
          className={classNames('h-[40px]', { 'animate-pulse': isLoading })}
        >
          <img src="/img/google-button.png" className="h-full" />
        </button>
      )
    }

    return (
      <Button
        text={isAuthorized ? 'Re-authorize' : 'Authorize'}
        onClick={onAuthorize}
        disabled={!!requiredAuth?.length || isLoading}
        isLoading={isLoading}
        style={primaryColor ? { backgroundColor: primaryColor } : {}}
      />
    )
  }

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

      <div className="flex items-center">
        {renderButton()}

        {isAuthorized && connection.oauth_grant_type === 'authorization_code' && (
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
