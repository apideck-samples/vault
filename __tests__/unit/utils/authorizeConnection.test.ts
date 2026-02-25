import { authorizeConnection } from 'utils/authorizeConnection'
import client from 'lib/axios'

jest.mock('lib/axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn()
  }
}))

describe('authorizeConnection', () => {
  const headers = {
    Authorization: 'Bearer test-jwt',
    'X-APIDECK-APP-ID': 'test-app-id',
    'X-APIDECK-CONSUMER-ID': 'test-consumer-id'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorage.clear()
  })

  it('returns authorize URL from POST response', async () => {
    ;(client.post as jest.Mock).mockResolvedValue({
      data: {
        data: {
          authorize_url: 'https://accounts.google.com/o/oauth2/auth?state=abc123'
        }
      }
    })

    const result = await authorizeConnection('crm', 'salesforce', 'test-nonce', headers)

    expect(result).toEqual({
      authorize_url: 'https://accounts.google.com/o/oauth2/auth?state=abc123'
    })
  })

  it('calls correct URL with nonce in body', async () => {
    ;(client.post as jest.Mock).mockResolvedValue({
      data: { data: { authorize_url: 'https://example.com' } }
    })

    await authorizeConnection('crm', 'salesforce', 'my-nonce', headers)

    expect(client.post).toHaveBeenCalledWith(
      '/vault/connections/crm/salesforce/authorize',
      { nonce: 'my-nonce' },
      { headers }
    )
  })

  it('passes correct headers', async () => {
    ;(client.post as jest.Mock).mockResolvedValue({
      data: { data: { authorize_url: 'https://example.com' } }
    })

    await authorizeConnection('crm', 'hubspot', 'nonce-123', headers)

    expect(client.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), {
      headers: {
        Authorization: 'Bearer test-jwt',
        'X-APIDECK-APP-ID': 'test-app-id',
        'X-APIDECK-CONSUMER-ID': 'test-consumer-id'
      }
    })
  })

  it('surfaces error on failure', async () => {
    ;(client.post as jest.Mock).mockRejectedValue(new Error('Network error'))

    await expect(authorizeConnection('crm', 'salesforce', 'nonce', headers)).rejects.toThrow(
      'Network error'
    )
  })
})
