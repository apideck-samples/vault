import { IConnection } from 'types/Connection'
import { isConnected } from 'utils/isConnected'

describe('isConnected()', () => {
  describe('AuthType OAuth', () => {
    it('returns true when revoke_url is present', () => {
      const connection: IConnection = {
        id: 'lead+pipedrive',
        name: 'Pipedrive',
        icon: 'https://example.com/icon128x128.png',
        unified_api: 'lead',
        service_id: 'pipedrive',
        auth_type: 'oauth2',
        authorize_url: 'https://example.com/authorize',
        revoke_url: 'https://example.com/revoke',
        form_fields: [],
        added: true,
        configured: true,
        created_at: 1606221287456
      }

      expect(isConnected(connection)).toStrictEqual(true)
    })

    it('returns false when revoke_url is null', () => {
      const connection: IConnection = {
        id: 'lead+pipedrive',
        name: 'Pipedrive',
        icon: 'https://example.com/icon128x128.png',
        unified_api: 'lead',
        service_id: 'pipedrive',
        auth_type: 'oauth2',
        authorize_url: 'https://example.com/authorize',
        revoke_url: null,
        form_fields: [],
        added: true,
        configured: true,
        created_at: 1606221287456
      }

      expect(isConnected(connection)).toStrictEqual(false)
    })
  })

  describe('AuthType apiKey', () => {
    it('returns true when connection has values for required form_fields', () => {
      const connection: IConnection = {
        id: 'lead+freshsales',
        name: 'Freshsales',
        icon: 'https://example.com/icon128x128.png',
        unified_api: 'lead',
        service_id: 'freshsales',
        auth_type: 'apiKey',
        form_fields: [
          {
            id: 'api_key',
            label: 'API Key',
            value: 'api_foo',
            placeholder: '',
            mask: false,
            type: 'text',
            required: true,
            description: '',
            disabled: false
          }
        ],
        added: true,
        configured: true,
        created_at: 1606221287456
      }
      expect(isConnected(connection)).toStrictEqual(true)
    })

    it('returns false when connection is missing values for required form_fields', () => {
      const connection: IConnection = {
        id: 'lead+freshsales',
        name: 'Freshsales',
        icon: 'https://example.com/icon128x128.png',
        unified_api: 'lead',
        service_id: 'freshsales',
        auth_type: 'apiKey',
        form_fields: [
          {
            id: 'api_key',
            label: 'API Key',
            value: '',
            placeholder: '',
            mask: false,
            type: 'text',
            required: true,
            description: '',
            disabled: false
          }
        ],
        added: true,
        configured: false,
        created_at: 1606221287456
      }
      expect(isConnected(connection)).toStrictEqual(false)
    })
  })

  describe('No AuthType', () => {
    it('returns true', () => {
      const connection: IConnection = {
        id: 'script+drift',
        name: 'Drift',
        icon: 'https://example.com/icon128x128.png',
        auth_type: '',
        form_fields: [],
        service_id: 'drift',
        unified_api: 'script',
        added: true,
        configured: true,
        created_at: 1606221287456
      }
      expect(isConnected(connection)).toStrictEqual(true)
    })
  })
})
