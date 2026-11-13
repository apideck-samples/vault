import { JWTSession } from 'types/JWTSession'
import { formatConsumerIdentity } from 'utils/consumerIdentity'

interface IProps {
  session?: Partial<JWTSession> | null
}

const ConsumerIdentity = ({ session }: IProps) => {
  const identity = formatConsumerIdentity(session)
  if (!identity) return null

  return (
    <div data-testid="consumer-identity" className="text-sm text-gray-700 break-words">
      Connecting for <span className="font-medium">{identity}</span>
    </div>
  )
}

export default ConsumerIdentity
