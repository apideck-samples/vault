import { render, screen } from '../../../testUtils/testing-utils'

import { ConnectionBadge } from 'components/Connections'
import { IConnection } from 'types/Connection'

const baseConnection: Partial<IConnection> = {
  id: 'lead+test',
  name: 'Test',
  state: 'callable',
  enabled: true,
  integration_state: 'configured'
}

const renderBadge = (overrides: Partial<IConnection> = {}, showConfig = true) => {
  const connection = { ...baseConnection, ...overrides } as IConnection
  return render(<ConnectionBadge connection={connection} showConfig={showConfig} />)
}

describe('ConnectionBadge', () => {
  it('shows "Enabled" when state is callable', () => {
    renderBadge({ state: 'callable', enabled: true })
    expect(screen.getByText('Enabled')).toBeDefined()
  })

  it('shows "Disabled" when not enabled', () => {
    renderBadge({ state: 'callable', enabled: false })
    expect(screen.getByText('Disabled')).toBeDefined()
  })

  it('shows "Invalid configuration" when state is invalid', () => {
    renderBadge({ state: 'invalid', enabled: true })
    expect(screen.getByText('Invalid configuration')).toBeDefined()
  })

  it('shows "Needs configuration" as fallback', () => {
    renderBadge({ state: 'added', enabled: true })
    expect(screen.getByText('Needs configuration')).toBeDefined()
  })

  it('shows "Pending confirmation" when health is pending_confirmation', () => {
    renderBadge({ state: 'authorized', enabled: true, health: 'pending_confirmation' })
    expect(screen.getByText('Pending confirmation')).toBeDefined()
  })

  it('shows "Pending confirmation" over "Needs configuration" fallback', () => {
    renderBadge({ state: 'added', enabled: true, health: 'pending_confirmation' })
    expect(screen.getByText('Pending confirmation')).toBeDefined()
    expect(screen.queryByText('Needs configuration')).toBeNull()
  })

  it('does not show "Pending confirmation" when health is ok', () => {
    renderBadge({ state: 'callable', enabled: true, health: 'ok' })
    expect(screen.getByText('Enabled')).toBeDefined()
    expect(screen.queryByText('Pending confirmation')).toBeNull()
  })

  it('shows "Consent required" over "Pending confirmation"', () => {
    renderBadge({
      state: 'authorized',
      enabled: true,
      health: 'pending_confirmation',
      consent_state: 'pending'
    })
    expect(screen.getByText('Consent required')).toBeDefined()
    expect(screen.queryByText('Pending confirmation')).toBeNull()
  })
})
