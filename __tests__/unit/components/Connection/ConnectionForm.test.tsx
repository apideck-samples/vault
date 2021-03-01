import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '../../../testUtils/testing-utils'
import { jwt, token } from '../../../fixtures/session'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConnectionForm } from 'components'
import { IConnection } from 'types/Connection'
import INTEGRATIONS from '../../../fixtures/integrations.json'
import client from 'lib/axios'

describe('Connection Form', () => {
  const handleSubmit = jest.fn()
  const handleDelete = jest.fn()
  const deleteMock = jest.spyOn(client, 'delete').mockResolvedValue(true)

  describe('OAuth Connector', () => {
    describe('When Connector isConfigured', () => {
      let connection = INTEGRATIONS.data.find((connector: any) => {
        return connector.id === 'lead+microsoft-dynamics'
      }) as IConnection
      connection = {
        ...connection,
        configured: true,
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
            custom_field: false
          }
        ]
      }

      it('Renders Connection Form w settings', async () => {
        render(
          <ConnectionForm
            connection={connection}
            jwt={jwt}
            token={token}
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
          />
        )
        expect(screen.getByRole('heading', { name: 'Microsoft Dynamics CRM' })).toBeInTheDocument()
        expect(screen.getByDisplayValue('example')).toBeInTheDocument()

        const authorizeButton = screen.getByRole('button', { name: 'Authorize' })
        expect(authorizeButton).toBeInTheDocument()
        expect(authorizeButton).not.toBeDisabled()
      })
    })

    describe('When Connector is missing authorizationVariables', () => {
      const connection = INTEGRATIONS.data.find((connector: any) => {
        return connector.id === 'lead+microsoft-dynamics'
      }) as IConnection

      const updateMock = jest.spyOn(client, 'patch').mockResolvedValue({
        data: {
          ...connection,
          configured: true,
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
        render(
          <ConnectionForm
            connection={connection}
            jwt={jwt}
            token={token}
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
          />
        )
        expect(screen.getByRole('heading', { name: 'Microsoft Dynamics CRM' })).toBeInTheDocument()
        const warning = screen.getByText(
          'Microsoft Dynamics CRM requires Organisation Url to be set before authorizing.'
        )
        expect(warning).toBeInTheDocument()

        const authorizeButton = screen.getByRole('button', { name: 'Authorize' })
        expect(authorizeButton).toBeInTheDocument()
        expect(authorizeButton).toBeDisabled()

        const saveButton = screen.getByRole('button', { name: 'Save' })
        const settingInput = screen.getByTestId('organisation_url')

        fireEvent.change(settingInput, { target: { value: 'foobar' } })
        fireEvent.click(saveButton)
        await waitFor(() => {
          screen.getByText('Your changes have been saved.')
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
      render(
        <ConnectionForm
          connection={connection}
          jwt={jwt}
          token={token}
          handleSubmit={handleSubmit}
          handleDelete={handleDelete}
        />
      )
      expect(screen.getByText('Copper')).toBeInTheDocument()
      expect(
        screen.getByText(
          'When you need CRM software that works with G Suite, you need Copper. Give us a try and see how we can help your business build stronger customer relationships.'
        )
      ).toBeInTheDocument()

      expect(screen.getByDisplayValue('nick@apideck.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('21cafde969594a339fcbb4f3ff2600aa')).toBeInTheDocument()
    })

    it('Uses Modal to confirm delete Connection', async () => {
      render(
        <ConnectionForm
          connection={connection}
          jwt={jwt}
          token={token}
          handleSubmit={handleSubmit}
          handleDelete={handleDelete}
        />
      )
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
