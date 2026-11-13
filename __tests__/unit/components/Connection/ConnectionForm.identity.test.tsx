import { jwt, token } from '../../../fixtures/session'
import { render, screen } from '../../../testUtils/testing-utils'

import { ConnectionForm } from 'components'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import INTEGRATIONS from '../../../fixtures/integrations.json'

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({ route: '/', pathname: '', query: {}, asPath: '', push: jest.fn() }))
}))

const findConnection = (id: string) =>
  INTEGRATIONS.data.find((connector: any) => connector.id === id) as IConnection

const oauthConnection: IConnection = {
  ...findConnection('lead+microsoft-dynamics'),
  state: 'added',
  form_fields: [
    {
      id: 'organisation_url',
      label: 'Organisation Url',
      value: 'example',
      placeholder: '',
      mask: false,
      type: 'text',
      required: true,
      description: '',
      disabled: false,
      options: [],
      custom_field: false,
      hidden: false
    }
  ]
}

const apiKeyConnection = findConnection('lead+copper')

const janeSession: JWTSession = {
  ...token,
  consumerId: 'consumer-123',
  consumerMetadata: { userName: 'Jane Doe', email: 'jane@acme.com', accountName: 'Acme' }
}

const JANE_IDENTITY = 'Connecting for Jane Doe (jane@acme.com) · Acme'

const renderForm = (session: JWTSession, connection: IConnection = oauthConnection) =>
  render(<ConnectionForm connection={connection} jwt={jwt} token={session} />)

const identityLine = () => screen.getByTestId('consumer-identity')

const precedes = (first: Element, second: Element) =>
  (first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0

describe('ConnectionForm consumer identity', () => {
  it('shows "Connecting for Jane Doe (jane@acme.com) · Acme" in the connection header', () => {
    renderForm(janeSession)

    const identity = identityLine()
    expect(identity.textContent).toBe(JANE_IDENTITY)

    const headerColumn = screen.getByRole('heading', { name: 'Microsoft Dynamics CRM' })
      .parentElement as HTMLElement
    expect(headerColumn.contains(identity)).toBe(true)
  })

  it('shows the identity when showSidebar is false and hideConsumerCard is true', () => {
    renderForm({
      ...janeSession,
      settings: { ...janeSession.settings, showSidebar: false, hideConsumerCard: true }
    })

    expect(identityLine().textContent).toBe(JANE_IDENTITY)
  })

  it('renders the identity before the Authorize button', () => {
    renderForm(janeSession)

    expect(precedes(identityLine(), screen.getByRole('button', { name: 'Authorize' }))).toBe(true)
  })

  it('renders the identity before Save for an API-key connector', () => {
    renderForm(janeSession, apiKeyConnection)

    expect(precedes(identityLine(), screen.getByRole('button', { name: 'Save' }))).toBe(true)
  })

  it('shows "Connecting for <consumerId>" without consumer metadata', () => {
    renderForm({ ...token, consumerId: 'consumer-123', consumerMetadata: undefined })

    expect(identityLine().textContent).toBe('Connecting for consumer-123')
  })

  it('never shows Account Name, User name, test@test.com or the unavatar image without consumer metadata', () => {
    renderForm({ ...token, consumerId: 'consumer-123', consumerMetadata: undefined })

    const text = document.body.textContent as string
    expect(text).not.toContain('Account Name')
    expect(text).not.toContain('User name')
    expect(text).not.toContain('test@test.com')
    expect(document.querySelector('img[src*="unavatar.now.sh"]')).toBeNull()
  })

  it('renders no identity line without metadata and consumer id', () => {
    renderForm({
      ...token,
      consumerId: (undefined as unknown) as string,
      consumerMetadata: undefined
    })

    expect(screen.getByRole('heading', { name: 'Microsoft Dynamics CRM' })).toBeTruthy()
    expect(screen.queryByTestId('consumer-identity')).toBeNull()
    expect(document.body.textContent).not.toContain('Connecting for')
  })
})
