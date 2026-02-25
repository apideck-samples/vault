const NONCE_KEY_PREFIX = 'apideck_oauth_nonce_'

export const generateNonce = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return [...bytes]
    .map((b, i) =>
      [4, 6, 8, 10].includes(i)
        ? `-${b.toString(16).padStart(2, '0')}`
        : b.toString(16).padStart(2, '0')
    )
    .join('')
}

export const storeNonce = (serviceId: string, nonce: string): void => {
  sessionStorage.setItem(`${NONCE_KEY_PREFIX}${serviceId}`, nonce)
}

export const retrieveAndClearNonce = (serviceId: string): string | null => {
  const key = `${NONCE_KEY_PREFIX}${serviceId}`
  const nonce = sessionStorage.getItem(key)
  sessionStorage.removeItem(key)
  return nonce
}
