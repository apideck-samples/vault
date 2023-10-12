import { jwt, token } from '../../../fixtures/session'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '../../../testUtils/testing-utils'

import { ConnectionForm } from 'components'
import client from 'lib/axios'
import { IConnection } from 'types/Connection'
import INTEGRATIONS from '../../../fixtures/integrations.json'

const router = {
  route: '/',
  pathname: '',
  query: {
    error_type: 'OAuthInvalidStateError',
    error_message: 'State parameter is not a valid JWT token. It may have expired.',
    origin: 'authorize',
    service_id: 'zoho-crm',
    application_id: '1111',
    ref: 'https://developers.apideck.com/errors#oauthinvalidstateerror'
  },
  asPath: ''
}

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockReturnValue(router)
}))

describe('Connection Form', () => {
  const deleteMock = jest.spyOn(client, 'delete').mockResolvedValue(true)

  describe('OAuth Connector', () => {
    describe('When Connector isConfigured', () => {
      let connection = INTEGRATIONS.data.find((connector: any) => {
        return connector.id === 'lead+microsoft-dynamics'
      }) as IConnection
      connection = {
        ...connection,
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

      it('Renders Connection Form w settings', async () => {
        render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)
        expect(screen.getByRole('heading', { name: 'Microsoft Dynamics CRM' })).toBeDefined()
        expect(screen.getByDisplayValue('example')).toBeDefined()

        const authorizeButton = screen.getByRole('button', {
          name: 'Authorize'
        }) as HTMLButtonElement
        expect(authorizeButton).toBeDefined()
        expect(authorizeButton.disabled).toBeFalsy()
      })
    })

    describe('When an OAuth error occurred', () => {
      const connection = INTEGRATIONS.data.find((connector: any) => {
        return connector.id === 'lead+microsoft-dynamics'
      }) as IConnection

      it('Renders an Error Alert', async () => {
        render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)
        expect(screen.getByRole('alert')).toBeDefined()
        expect(
          screen.getByText('An error occurred during the authorization flow. Please try again.')
        ).toBeDefined()
      })
    })

    describe('When Connector is missing authorizationVariables', () => {
      const connection = INTEGRATIONS.data.find((connector: any) => {
        return connector.id === 'lead+microsoft-dynamics'
      }) as IConnection

      const updateMock = jest.spyOn(client, 'patch').mockResolvedValue({
        data: {
          ...connection,
          state: 'added',
          form_fields: [
            {
              id: 'organisation_url',
              label: 'Organisation Url',
              value: 'foobar',
              placeholder: '',
              mask: false,
              type: 'text',
              required: true,
              description: '',
              disabled: false
            }
          ]
        }
      })

      it('Renders Connection Form w settings as enabled', async () => {
        render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)
        expect(screen.getByRole('heading', { name: 'Microsoft Dynamics CRM' })).toBeDefined()
        const warning = screen.getByText(
          'Microsoft Dynamics CRM requires Organisation Url to be set before authorizing.'
        )
        expect(warning).toBeDefined()

        const authorizeButton = screen.getByRole('button', {
          name: 'Authorize'
        }) as HTMLButtonElement
        expect(authorizeButton).toBeDefined()
        expect(authorizeButton.disabled).toBeTruthy()

        const saveButton = screen.getByRole('button', { name: 'Save' })
        const settingInput = screen.getByTestId('organisation_url')

        fireEvent.change(settingInput, { target: { value: 'foobar' } })
        fireEvent.click(saveButton)
        await waitFor(() => {
          screen.getByText('Your changes have been saved')
        })

        expect(updateMock).toHaveBeenCalled()
      })
    })
  })

  describe('ApiKey Connector', () => {
    const connection = INTEGRATIONS.data.find((connector: any) => {
      return connector.id === 'lead+copper'
    }) as IConnection

    it('Renders Connection Form w settings as enabled', async () => {
      render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)
      expect(screen.getByText('Copper')).toBeDefined()
      expect(screen.getByDisplayValue('nick@apideck.com')).toBeDefined()
      expect(screen.getByDisplayValue('21cafde969594a339fcbb4f3ff2600aa')).toBeDefined()
    })

    it('Uses Modal to confirm delete Connection', async () => {
      render(<ConnectionForm connection={connection} jwt={jwt} token={token} />)
      const openDeleteModalButton = screen.getByRole('button', { name: 'Delete' })

      fireEvent.click(openDeleteModalButton)

      await waitFor(() => screen.getByTestId('modal-container'))

      const modal = within(screen.getByTestId('modal-container'))
      const deleteButton = modal.getByRole('button', { name: 'Delete' })

      fireEvent.click(deleteButton)
      waitForElementToBeRemoved(deleteButton)
      expect(deleteMock).toHaveBeenCalled()
    })
  })
})
