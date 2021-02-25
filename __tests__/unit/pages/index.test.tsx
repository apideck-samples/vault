/* eslint-disable @typescript-eslint/no-empty-function */
import Home from 'pages/index'
import { IConnection } from 'types/Connection'
import INTEGRATIONS from '../../fixtures/integrations.json'
import { jwt, token } from '../../fixtures/session'
import { render, screen, waitFor } from '../../testUtils/testing-utils'

describe('Home', () => {
  describe('when consumer has no Integrations', () => {
    it('should render without barfing', async () => {
      render(
        <Home connections={[]} setConnections={() => {}} loading={false} jwt={jwt} token={token} />
      )

      expect(screen.getByRole('heading', { name: 'Manage your integrations' })).toBeInTheDocument()
      expect(screen.getByText('No integrations available.')).toBeInTheDocument()
    })
  })

  describe('when consumer has Integrations', () => {
    it('should render ConnectionsList', async () => {
      render(
        <>
          <Home
            connections={[INTEGRATIONS.data[0] as IConnection]}
            setConnections={() => {}}
            loading={false}
            jwt={jwt}
            token={token}
          />
        </>
      )
      await waitFor(() => screen.getByTestId('connections-list'))

      expect(screen.getByRole('heading', { name: 'Manage your integrations' })).toBeInTheDocument()
      expect(screen.getByTestId('connections-list')).toBeInTheDocument()
    })
  })
})
