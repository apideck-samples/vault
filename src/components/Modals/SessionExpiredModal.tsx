import { Button } from '@apideck/components'
import { useContext } from 'react'
import { ThemeContext, ThemeContextType } from 'utils'
import ModalContainer from './ModalContainer'

interface IProps {
  open: boolean
  setOpen: (input: boolean) => void
  redirectUri: string
}

const SessionExpiredModal = ({
  open,
  setOpen,
  redirectUri = 'https://app.apideck.com'
}: IProps) => {
  const handleClick = () => (window.location.href = redirectUri)
  const { primary_color } = useContext(ThemeContext) as ThemeContextType

  return (
    <ModalContainer open={open} setOpen={setOpen} width={380} disableClose>
      <div className="px-5 py-4">
        <h2 className="font-medium">Session expired</h2>
      </div>
      <div className="px-5 py-8 text-gray-600 border-t border-b" style={{ fontSize: '0.9735rem' }}>
        Looks like your current session is expired. Please try again.
      </div>
      <div className="flex items-center justify-end px-5 py-2">
        <Button
          text="Return to application"
          onClick={() => handleClick()}
          style={primary_color ? { backgroundColor: primary_color } : {}}
        />
      </div>
    </ModalContainer>
  )
}

export default SessionExpiredModal
