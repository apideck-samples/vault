import { fireEvent, render, screen, waitFor } from '../../../testUtils/testing-utils'
import { jwt, token } from '../../../fixtures/session'

import CONFIG from '../../../fixtures/connection-config.json'
import CONNECTIONS from '../../../fixtures/connections.json'
import { ResourceForm } from 'components'
import client from 'lib/axios'

describe('Resource Form', () => {
  describe('With Salesforce CRM connector', () => {
    let connection = CONNECTIONS.find((connector) => {
      return connector.id === 'crm+salesforce'
    }) as any
    connection = {
      ...connection,
      ...CONFIG
    }

    it('should render the loading state of the form', async () => {
      render(
        <ResourceForm
          loading={true}
          connection={connection}
          resource="opportunities"
          jwt={jwt}
          token={token}
        />
      )

      const placeholder = screen.getByTestId('resourcePlaceholder')
      expect(placeholder).toBeInTheDocument()
    })

    it('should render a submit button', async () => {
      render(
        <ResourceForm
          loading={false}
          connection={connection}
          resource="opportunities"
          jwt={jwt}
          token={token}
        />
      )
      const submitButton = screen.getByRole('button', { name: 'Save' })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).not.toBeDisabled()
    })

    it('should submit the form and show a success message', async () => {
      const updateMock = jest.spyOn(client, 'patch').mockResolvedValue({
        data: {
          ...connection
        }
      })

      render(
        <ResourceForm
          loading={false}
          connection={connection}
          resource="opportunities"
          jwt={jwt}
          token={token}
        />
      )
      const submitButton = screen.getByRole('button', { name: 'Save' })
      const settingInput = screen.getByTestId('TrackingNumber__c')

      fireEvent.change(settingInput, { target: { value: 'Track this' } })
      fireEvent.click(submitButton)
      await waitFor(() => {
        screen.getByText('Your changes have been saved.')
      })

      expect(updateMock).toHaveBeenCalled()
    })

    it('should show the required indicator if form contains required field', async () => {
      const connectionWithRequireField = {
        ...connection,
        configuration: [
          ...connection.configuration,
          {
            id: 'test-field',
            label: 'Test Label',
            custom_field: true,
            default_value: null,
            description: null,
            mask: null,
            required: true,
            type: 'text',
            options: [],
            value: null
          }
        ]
      }

      render(
        <ResourceForm
          loading={false}
          connection={connectionWithRequireField}
          resource="opportunities"
          jwt={jwt}
          token={token}
        />
      )

      expect(screen.getByTestId('required')).toBeInTheDocument()
    })
  })
})
