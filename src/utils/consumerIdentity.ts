import { JWTSession } from 'types/JWTSession'

const SEPARATOR = ' · '

const text = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

/**
 * Names the consumer a Hosted Vault session belongs to, e.g.
 * "Jane Doe (jane@acme.com) · Acme". The session is decoded without
 * verification, so every value is checked to be a non-empty string.
 * The consumer id is used only when no metadata value is present.
 */
export const formatConsumerIdentity = (
  session: Partial<JWTSession> | null | undefined
): string | null => {
  const metadata = session?.consumerMetadata
  const userName = text(metadata?.userName)
  const email = text(metadata?.email)
  const accountName = text(metadata?.accountName)

  const primary = userName || email || accountName
  if (!primary) return text(session?.consumerId) ?? null

  const shownEmail = userName && email && email !== userName ? email : undefined
  let identity = shownEmail ? `${primary} (${shownEmail})` : primary

  if (accountName && accountName !== primary && accountName !== shownEmail) {
    identity += `${SEPARATOR}${accountName}`
  }

  return identity
}
