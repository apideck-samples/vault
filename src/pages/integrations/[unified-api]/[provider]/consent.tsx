import { Alert, Button, useToast } from '@apideck/components'
import camelcaseKeys from 'camelcase-keys-deep'
import { ErrorBlock } from 'components'
import { ScopesList } from 'components/Consent/ScopesList'
import ModalContainer from 'components/Modals/ModalContainer'
import { decode } from 'jsonwebtoken'
import client from 'lib/axios'
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { IConnection, DataScopesFields } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { getNewScopes, hasApplicableScopes } from 'utils/consent'
import { useConsent } from 'utils/useConsent'
import { useSession } from 'utils/useSession'

interface ConsentPageProps {
  jwt: string
  token: JWTSession
  unifiedApi: string
  provider: string
}

const ConsentPage = ({ jwt, token, unifiedApi, provider }: ConsentPageProps) => {
  const { session, setSession } = useSession()
  const { addToast } = useToast()
  const router = useRouter()

  const [showDenyModal, setShowDenyModal] = useState(false)

  useEffect(() => {
    if (jwt?.length && token) {
      setSession({ ...token, jwt })
    }
  }, [jwt, setSession, token])

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt || session?.jwt}`,
        'X-APIDECK-APP-ID': `${token?.applicationId || session?.applicationId}`,
        'X-APIDECK-CONSUMER-ID': `${token?.consumerId || session?.consumerId}`
      }
    })
  }

  const { data, error } = useSWR(
    session?.jwt || jwt ? `/vault/connections/${unifiedApi}/${provider}` : null,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false
    }
  )

  const connection: IConnection = data?.data?.data
  const { grantConsent, denyConsent, loading, error: consentError } = useConsent({
    connection,
    token: session || token,
    jwt: session?.jwt || jwt
  })

  // Calculate new scopes for re-consent flow
  const newScopes = useMemo(() => {
    if (
      !connection ||
      connection.consent_state !== 'requires_reconsent' ||
      !connection.latest_consent?.granted ||
      !connection.application_data_scopes?.resources ||
      connection.application_data_scopes.resources === '*' ||
      connection.latest_consent.resources === '*'
    ) {
      return {}
    }

    return getNewScopes(
      connection.application_data_scopes.resources as DataScopesFields,
      connection.latest_consent.resources
    )
  }, [connection])

  const handleGrant = async () => {
    try {
      const resources = connection.application_data_scopes?.resources || {}
      await grantConsent(resources === '*' ? '*' : (resources as DataScopesFields))
      addToast({
        title: 'Consent granted',
        description: 'You have successfully granted data access permissions.',
        type: 'success',
        autoClose: true
      })
    } catch (err) {
      addToast({
        title: 'Failed to grant consent',
        description: consentError || 'Please try again.',
        type: 'error',
        autoClose: true
      })
    }
  }

  const handleDeny = async () => {
    setShowDenyModal(false)
    try {
      await denyConsent()
      addToast({
        title: 'Consent denied',
        description: 'You have denied data access permissions.',
        type: 'info',
        autoClose: true
      })
    } catch (err) {
      addToast({
        title: 'Failed to deny consent',
        description: consentError || 'Please try again.',
        type: 'error',
        autoClose: true
      })
    }
  }

  if (!data && !error && !session && !jwt) {
    return <ErrorBlock error={{ status: 401 }} />
  }

  if (!data && !error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !connection) {
    const errorObj = error?.response ? error.response : { status: 400 }
    return <ErrorBlock error={errorObj} token={session || token} />
  }

  if (!hasApplicableScopes(connection)) {
    router.push(`/integrations/${unifiedApi}/${provider}`)
    return null
  }

  const applicationScopes = connection.application_data_scopes?.resources
  const isReConsent = connection.consent_state === 'requires_reconsent'

  return (
    <div>
      <div className="mb-4">
        <Link href="/">
          <button className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
            <ArrowLeftIcon className="mr-1" size={16} />
            <span>Back to integrations</span>
          </button>
        </Link>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="px-5 py-4 flex items-center">
          {connection.icon && (
            <img className="w-10 h-10 mr-4 rounded" src={connection.icon} alt={connection.name} />
          )}
          <div>
            <h1 className="text-xl font-medium text-gray-800">
              {isReConsent ? 'Updated Permissions Required' : 'Grant Data Access Permissions'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {connection.name} is requesting access to the following data
            </p>
          </div>
        </div>

        <div className="px-5 py-6 bg-gray-50 border-t">
          {isReConsent && Object.keys(newScopes).length > 0 && (
            <Alert
              className="mb-4"
              variant="warning"
              title="New permissions required"
              description="The following permissions are new or have been updated since you last granted consent."
            />
          )}

          {applicationScopes !== '*' && typeof applicationScopes === 'object' ? (
            <ScopesList
              scopes={applicationScopes as DataScopesFields}
              highlightedScopes={newScopes}
            />
          ) : (
            <Alert
              variant="info"
              title="Full access requested"
              description={`${connection.name} is requesting full access to all data resources.`}
            />
          )}

          {consentError && (
            <Alert className="mt-4" variant="danger" title="Error" description={consentError} />
          )}
        </div>

        <div className="px-5 py-4 bg-white border-t flex items-center justify-between">
          <Button
            variant="outline"
            text="Deny"
            onClick={() => setShowDenyModal(true)}
            disabled={loading}
          />
          <Button text="Grant Access" onClick={handleGrant} isLoading={loading} />
        </div>
      </div>

      {/* Deny Confirmation Modal */}
      <ModalContainer open={showDenyModal} setOpen={setShowDenyModal} width={410}>
        <div className="px-5 py-4">
          <h2 className="font-medium">Deny Access?</h2>
        </div>
        <div
          className="px-5 py-8 text-gray-600 border-t border-b"
          style={{ fontSize: '0.9735rem' }}
        >
          If you deny access, you will not be able to use this integration.
        </div>
        <div className="flex items-center justify-end px-5 py-2">
          <div className="mr-4">
            <Button text="Cancel" onClick={() => setShowDenyModal(false)} variant="outline" />
          </div>
          <div>
            <Button text="Deny Access" onClick={handleDeny} variant="danger" isLoading={loading} />
          </div>
        </div>
      </ModalContainer>
    </div>
  )
}

export const getServerSideProps = async ({ query }: any): Promise<any> => {
  let token
  const { jwt } = query

  if (jwt) {
    const decoded = decode(jwt) as JWTSession
    if (decoded) {
      token = camelcaseKeys(decoded) as any
    }
  }

  return {
    props: {
      jwt: jwt || null,
      token: token || null,
      unifiedApi: query['unified-api'],
      provider: query['provider']
    }
  }
}

export default ConsentPage
