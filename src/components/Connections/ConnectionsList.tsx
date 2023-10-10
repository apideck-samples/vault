import { AddModal, ConnectionCard } from 'components'
import { ThemeContext } from 'utils'
import { useContext, useState } from 'react'

import { Button } from '@apideck/components'
import { IConnection } from 'types/Connection'
import Link from 'next/link'
import { Theme } from 'types/JWTSession'

interface IProps {
  unifiedApi?: string
  connections: IConnection[]
  createConnection: (
    values: { unifiedApi: string; serviceId: string },
    successCallback: () => void,
    errorCallback: () => void
  ) => void
}

const ConnectionsList = ({ unifiedApi, connections = [], createConnection }: IProps) => {
  const [modalOpen, setModalOpen] = useState(false)
  const addedConnections = connections.filter((connection) => connection.state !== 'available')
  const availableConnections = connections.filter((connection) => connection.state === 'available')
  const noConnectionsAdded = addedConnections.length === 0
  const { primaryColor } = useContext(ThemeContext) as Theme

  return (
    <section className="mt-8 lg:mt-12" data-testid={'connections-list'}>
      {unifiedApi ? (
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-sm font-medium uppercase">{unifiedApi} integrations</h2>
          <Button
            text="+ Add"
            onClick={() => setModalOpen(true)}
            className="spec-add-integration"
            style={primaryColor ? { backgroundColor: primaryColor } : {}}
          />
        </div>
      ) : (
        ''
      )}
      {addedConnections.map((connection) => {
        const { id, unified_api, service_id } = connection

        return (
          <Link href={`/integrations/${unified_api}/${service_id}`} key={id} className="block mt-5">
            <ConnectionCard connection={connection} />
          </Link>
        )
      })}
      {noConnectionsAdded && (
        <div className="mt-5 text-sm italic text-gray-500">
          No {unifiedApi} integrations added yet.
        </div>
      )}
      {unifiedApi ? (
        <AddModal
          open={modalOpen}
          setOpen={setModalOpen}
          unifiedApi={unifiedApi}
          availableConnections={availableConnections}
          createConnection={createConnection}
        />
      ) : (
        ''
      )}
    </section>
  )
}

export default ConnectionsList
