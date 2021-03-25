import { ConnectionsList } from 'components'
import { IConnection } from 'types/Connection'
import INTEGRATIONS from '../../../fixtures/integrations.json'
import { fireEvent, render, screen, waitFor } from '../../../testUtils/testing-utils'

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
      expect(screen.getByRole('heading', { name: 'lead integrations' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '+ Add' })).toBeInTheDocument()
      expect(screen.getByText('No lead integrations added yet.')).toBeInTheDocument()
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
      expect(screen.getByRole('heading', { name: 'lead integrations' })).toBeInTheDocument()
      const addButton = screen.getByRole('button', { name: '+ Add' })
      expect(addButton).toBeInTheDocument()

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

    expect(screen.getByRole('heading', { name: 'lead integrations' })).toBeInTheDocument()
    const addButton = screen.getByRole('button', { name: '+ Add' })
    fireEvent.click(addButton)

    await waitFor(() => screen.getByTestId('modal-container'))

    expect(screen.getByRole('heading', { name: 'Add lead integration' })).toBeInTheDocument()
  })
})
