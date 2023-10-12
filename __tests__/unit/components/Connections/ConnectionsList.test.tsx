import { ConnectionsList } from 'components'
import { IConnection } from 'types/Connection'
import INTEGRATIONS from '../../../fixtures/integrations.json'
import { fireEvent, render, screen, waitFor } from '../../../testUtils/testing-utils'

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue({
    route: '/',
    pathname: '/',
    query: '',
    asPath: '/',
    prefetch: () => null,
    push: () => null
  })
}))

describe('Connections List', () => {
  describe('When no integrations have been added', () => {
    it('render message', async () => {
      const unifiedApi = 'lead'
      const createConnection = () => jest.fn()

      render(
        <ConnectionsList
          unifiedApi={unifiedApi}
          connections={[]}
          createConnection={createConnection}
        />
      )
      expect(screen.getByRole('heading', { name: 'lead integrations' })).toBeDefined()
      expect(screen.getByRole('button', { name: '+ Add' })).toBeDefined()
      expect(screen.getByText('No lead integrations added yet.')).toBeDefined()
    })
  })
  describe('With existing Integrations', () => {
    it('renders list of integrations', async () => {
      const unifiedApi = 'lead'
      const connections = INTEGRATIONS.data as IConnection[]
      const createConnection = () => jest.fn()

      render(
        <ConnectionsList
          unifiedApi={unifiedApi}
          connections={connections}
          createConnection={createConnection}
        />
      )
      expect(screen.getByRole('heading', { name: 'lead integrations' })).toBeDefined()
      const addButton = screen.getByRole('button', { name: '+ Add' })
      expect(addButton).toBeDefined()

      expect(screen.getAllByTestId('connection-link')).toHaveLength(4)
    })
  })

  it('Opens modal to add integration', async () => {
    const unifiedApi = 'lead'
    const createConnection = () => jest.fn()

    render(
      <ConnectionsList
        unifiedApi={unifiedApi}
        connections={[]}
        createConnection={createConnection}
      />
    )

    expect(screen.getByRole('heading', { name: 'lead integrations' })).toBeDefined()
    const addButton = screen.getByRole('button', { name: '+ Add' })
    fireEvent.click(addButton)

    await waitFor(() => screen.getByTestId('modal-container'))

    expect(screen.getByRole('heading', { name: 'Add lead integration' })).toBeDefined()
  })
})
