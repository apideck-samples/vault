import { ErrorBlock } from 'components'

const Custom404: React.FC = () => {
  return <ErrorBlock error={{ status: 404 }} />
}

export default Custom404
