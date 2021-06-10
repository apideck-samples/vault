import { ConnectionCard } from 'components'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import { IConnection } from 'types/Connection'
import { render, screen } from '../../../testUtils/testing-utils'

describe('Connection Card', () => {
  describe('When Connection has just been Added', () => {
    const connection: IConnection = {
      id: 'lead+pipedrive',
      name: 'Pipedrive',
      icon:
        'https://res.cloudinary.com/apideck/image/upload/v1529455988/catalog/pipedrive/icon128x128.png',
      unified_api: 'lead',
      service_id: 'pipedrive',
      auth_type: 'oauth2',
      revoke_url: null,
      created_at: 1606215640025,
      form_fields: [],
      configurable_resources: [],
      resource_schema_support: [],
      enabled: true,
      state: 'added'
    }

    it('Renders Integration and indicates configuration required', async () => {
      render(<ConnectionCard connection={connection} />)
      expect(screen.getByText('Pipedrive')).toBeInTheDocument()
      expect(screen.getByText('Needs configuration')).toBeInTheDocument()
      expect(
        screen.getByText(`Added ${formatDistanceToNow(connection.created_at)} ago`)
      ).toBeInTheDocument()
    })
  })

  describe('When Connection has been Configured', () => {
    const connection: IConnection = {
      id: 'lead+pipedrive',
      name: 'Pipedrive',
      icon:
        'https://res.cloudinary.com/apideck/image/upload/v1529455988/catalog/pipedrive/icon128x128.png',
      unified_api: 'lead',
      service_id: 'pipedrive',
      auth_type: 'oauth2',
      revoke_url: 'https://revoke.me',
      created_at: 1606215640025,
      form_fields: [],
      configurable_resources: [],
      resource_schema_support: [],
      enabled: true,
      state: 'callable'
    }

    it('Renders Integration as enabled', async () => {
      render(<ConnectionCard connection={connection} />)
      expect(screen.getByText('Pipedrive')).toBeInTheDocument()
      expect(screen.getByText('Enabled')).toBeInTheDocument()
      expect(
        screen.getByText(`Added ${formatDistanceToNow(connection.created_at)} ago`)
      ).toBeInTheDocument()
    })
  })
})
