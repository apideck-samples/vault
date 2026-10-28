import { JWTSession } from 'types/JWTSession'

const SEPARATOR = ' · '

/** The trimmed string, or undefined when the value is not a string or is blank. */
export const nonBlankText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

const sameText = (a: string | undefined, b: string | undefined): boolean =>
  a !== undefined && b !== undefined && a.toLowerCase() === b.toLowerCase()

/**
 * Names the consumer a Hosted Vault session belongs to, e.g.
 * "Jane Doe (jane@acme.com) · Acme". The session is decoded without
 * verification, so every value is checked to be a non-empty string.
 * Values that differ only in case are shown once.
 * The consumer id is used only when no metadata value is present.
 */
export const formatConsumerIdentity = (
  session: Partial<JWTSession> | null | undefined
): string | null => {
  const metadata = session?.consumerMetadata
  const userName = nonBlankText(metadata?.userName)
  const email = nonBlankText(metadata?.email)
  const accountName = nonBlankText(metadata?.accountName)

  const primary = userName || email || accountName
  if (!primary) return nonBlankText(session?.consumerId) ?? null

  const shownEmail = userName && email && !sameText(email, userName) ? email : undefined
  let identity = shownEmail ? `${primary} (${shownEmail})` : primary

  if (accountName && !sameText(accountName, primary) && !sameText(accountName, shownEmail)) {
    identity += `${SEPARATOR}${accountName}`
  }

  return identity
}
