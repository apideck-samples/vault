import { JWTSession } from 'types/JWTSession'
import { formatConsumerIdentity } from 'utils/consumerIdentity'

type ConsumerMetadata = NonNullable<JWTSession['consumerMetadata']>

const session = (
  consumerMetadata?: Record<string, unknown>,
  consumerId?: string
): Partial<JWTSession> => ({
  consumerMetadata: consumerMetadata as ConsumerMetadata | undefined,
  consumerId
})

describe('formatConsumerIdentity', () => {
  it('formats name, email and account as "Jane Doe (jane@acme.com) · Acme"', () => {
    expect(
      formatConsumerIdentity(
        session({ userName: 'Jane Doe', email: 'jane@acme.com', accountName: 'Acme' }, 'c-1')
      )
    ).toBe('Jane Doe (jane@acme.com) · Acme')
  })

  it('formats name and account as "Jane Doe · Acme"', () => {
    expect(formatConsumerIdentity(session({ userName: 'Jane Doe', accountName: 'Acme' }))).toBe(
      'Jane Doe · Acme'
    )
  })

  it('formats name and email as "Jane Doe (jane@acme.com)"', () => {
    expect(formatConsumerIdentity(session({ userName: 'Jane Doe', email: 'jane@acme.com' }))).toBe(
      'Jane Doe (jane@acme.com)'
    )
  })

  it('formats email and account as "jane@acme.com · Acme"', () => {
    expect(formatConsumerIdentity(session({ email: 'jane@acme.com', accountName: 'Acme' }))).toBe(
      'jane@acme.com · Acme'
    )
  })

  it('returns the email alone', () => {
    expect(formatConsumerIdentity(session({ email: 'jane@acme.com' }, 'c-1'))).toBe('jane@acme.com')
  })

  it('returns the account alone', () => {
    expect(formatConsumerIdentity(session({ accountName: 'Acme' }, 'c-1'))).toBe('Acme')
  })

  it('falls back to the consumer id without metadata', () => {
    expect(formatConsumerIdentity(session(undefined, 'consumer-123'))).toBe('consumer-123')
    expect(formatConsumerIdentity(session({}, 'consumer-123'))).toBe('consumer-123')
    expect(
      formatConsumerIdentity(session({ image: 'https://example.com/jane.png' }, 'consumer-123'))
    ).toBe('consumer-123')
  })

  it('does not repeat an email equal to the user name', () => {
    expect(
      formatConsumerIdentity(
        session({
          userName: 'nick@apideck.com',
          email: 'nick@apideck.com',
          accountName: 'Apideck Sandbox'
        })
      )
    ).toBe('nick@apideck.com · Apideck Sandbox')
  })

  it('treats an email that differs from userName only in case as the same value', () => {
    expect(formatConsumerIdentity(session({ userName: 'Nick@x.com', email: 'nick@x.com' }))).toBe(
      'Nick@x.com'
    )
    expect(
      formatConsumerIdentity(
        session({ userName: 'Jane Doe', email: 'Jane@Acme.com', accountName: 'jane@acme.com' })
      )
    ).toBe('Jane Doe (Jane@Acme.com)')
    expect(formatConsumerIdentity(session({ userName: 'ACME', accountName: 'Acme' }))).toBe('ACME')
  })

  it('does not repeat an account equal to the primary value', () => {
    expect(formatConsumerIdentity(session({ userName: 'Acme', accountName: 'Acme' }))).toBe('Acme')
    expect(
      formatConsumerIdentity(session({ email: 'jane@acme.com', accountName: 'jane@acme.com' }))
    ).toBe('jane@acme.com')
  })

  it('treats whitespace-only and non-string values as absent', () => {
    expect(
      formatConsumerIdentity(
        session({ userName: '   ', email: 42, accountName: ' Acme ' }, 'consumer-123')
      )
    ).toBe('Acme')
    expect(
      formatConsumerIdentity(
        session({ userName: null, email: ' jane@acme.com ', accountName: ['Acme'] })
      )
    ).toBe('jane@acme.com')
    expect(
      formatConsumerIdentity(session({ userName: '', email: {}, accountName: '\n\t' }, '  '))
    ).toBeNull()
  })

  it('returns null without metadata and consumer id', () => {
    expect(formatConsumerIdentity(session())).toBeNull()
    expect(formatConsumerIdentity(session({}))).toBeNull()
    expect(formatConsumerIdentity(null)).toBeNull()
    expect(formatConsumerIdentity(undefined)).toBeNull()
  })
})
