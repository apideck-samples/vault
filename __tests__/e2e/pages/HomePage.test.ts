import 'expect-playwright'
import 'jest-playwright-preset'

import INTEGRATIONS from '../../fixtures/integrations.json'
import { StatusCodes } from 'http-status-codes'

const mockResponseWith = async (status: number, data: unknown) => {
  await jestPlaywright.resetPage()
  await page.route('**/vault/connections', (route) => {
    route.fulfill({
      status: status,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data, null, 2)
    })
  })
  await page.goto('http://localhost:3004')
}

describe('Hosted Vault HomePage', () => {
  describe('With No Integrations', () => {
    beforeEach(async () => {
      await mockResponseWith(StatusCodes.OK, { data: [] })
    })

    it('render default empty view', async () => {
      await expect(page).toHaveText('H1', 'Manage your integrations')
      await expect(page).toHaveText('div', 'No integrations available.')
    })
  })

  describe('With Integrations', () => {
    beforeEach(async () => {
      await mockResponseWith(StatusCodes.OK, INTEGRATIONS)
    })

    it('renders integrations as a list', async () => {
      await expect(page).toHaveText('H1', 'Manage your integrations')
      await expect(page).toHaveText('button.spec-add-integration', '+ Add')
      await expect(page).toHaveSelector('.spec-connection', { state: 'visible' })
      await expect(page).toHaveText('.spec-connection-name', INTEGRATIONS.data[1].name)
    })
  })

  describe('when call to Unify returns Error', () => {
    it('should render default ErrorBlock on Bad Request', async () => {
      await mockResponseWith(StatusCodes.BAD_REQUEST, {})
      await expect(page).toHaveText('H1', 'Something went wrong.')
    })

    it('should render ErrorBlock on Not Found', async () => {
      await mockResponseWith(StatusCodes.NOT_FOUND, {})
      await expect(page).toHaveText('H1', 'Error 404')
    })

    it('should render ErrorBlock on Unauthorized', async () => {
      await mockResponseWith(StatusCodes.UNAUTHORIZED, {})
      await expect(page).toHaveText('H1', 'Your session is invalid.')
    })
  })
})
