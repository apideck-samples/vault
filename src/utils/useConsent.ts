import { useState } from 'react'
import { useRouter } from 'next/router'
import { IConnection, DataScopesFields } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import client from 'lib/axios'
import { mutate } from 'swr'

interface UseConsentProps {
  connection: IConnection | null | undefined
  token: JWTSession | null | undefined
  jwt: string | null | undefined
}

export const useConsent = ({ connection, token, jwt }: UseConsentProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const getHeaders = () => ({
    Authorization: `Bearer ${jwt}`,
    'X-APIDECK-APP-ID': token?.applicationId || '',
    'X-APIDECK-CONSUMER-ID': token?.consumerId || ''
  })

  const consentUrl = connection
    ? `/vault/connections/${connection.unified_api}/${connection.service_id}/consent`
    : null

  const grantConsent = async (resources: '*' | DataScopesFields) => {
    if (!consentUrl || !connection) return
    setLoading(true)
    setError(null)

    try {
      await client.patch(consentUrl, { granted: true, resources }, { headers: getHeaders() })

      // Refresh connection data (specific first, then global)
      await mutate(`/vault/connections/${connection.unified_api}/${connection.service_id}`)
      mutate('/vault/connections')

      // Navigate back to connection details
      router.push(`/integrations/${connection.unified_api}/${connection.service_id}`)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to grant consent')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const denyConsent = async () => {
    if (!consentUrl || !connection) return
    setLoading(true)
    setError(null)

    try {
      await client.patch(consentUrl, { granted: false, resources: {} }, { headers: getHeaders() })

      await mutate(`/vault/connections/${connection.unified_api}/${connection.service_id}`)
      mutate('/vault/connections')

      // Navigate back to home
      router.push('/')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to deny consent')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const revokeConsent = async () => {
    if (!consentUrl || !connection) return
    setLoading(true)
    setError(null)

    try {
      await client.patch(consentUrl, { granted: false, resources: {} }, { headers: getHeaders() })

      await mutate(`/vault/connections/${connection.unified_api}/${connection.service_id}`)
      await mutate(consentUrl)
      mutate('/vault/connections')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to revoke consent')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { grantConsent, denyConsent, revokeConsent, loading, error }
}
