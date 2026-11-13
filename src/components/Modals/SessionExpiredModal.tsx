import { Button } from '@apideck/components'
import { useContext } from 'react'
import { Theme } from 'types/JWTSession'
import { ThemeContext } from 'utils'
import { navigateTo } from 'utils/navigate'
import { returnToAppHref } from 'utils/safeUrl'
import ModalContainer from './ModalContainer'

interface IProps {
  open: boolean
  setOpen: (input: boolean) => void
  redirectUri?: string
}

const SessionExpiredModal = ({ open, setOpen, redirectUri }: IProps) => {
  const href = returnToAppHref(redirectUri)
  const { primaryColor } = useContext(ThemeContext) as Theme

  return (
    <ModalContainer open={open} setOpen={setOpen} width={380} disableClose>
      <div className="px-5 py-4">
        <h2 className="font-medium">Session expired</h2>
      </div>
      <div className="px-5 py-8 text-gray-600 border-t border-b" style={{ fontSize: '0.9735rem' }}>
        Looks like your current session is expired. Please try again.
      </div>
      <div className="flex items-center justify-end px-5 py-2">
        {href && (
          <Button
            text="Return to application"
            onClick={() => navigateTo(href)}
            style={primaryColor ? { backgroundColor: primaryColor } : {}}
          />
        )}
      </div>
    </ModalContainer>
  )
}

export default SessionExpiredModal
