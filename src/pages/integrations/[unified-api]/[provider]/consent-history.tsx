import { useEffect, useState } from 'react'
import { decode } from 'jsonwebtoken'
import camelcaseKeys from 'camelcase-keys-deep'
import useSWR from 'swr'
import { Button, useToast } from '@apideck/components'
import { ErrorBlock } from 'components'
import { ScopesList } from 'components/Consent/ScopesList'
import { IConnection, ConsentRecord, DataScopesFields } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { useSession } from 'utils/useSession'
import { getScopeSummary } from 'utils/consent'
import { useConsent } from 'utils/useConsent'
import client from 'lib/axios'
import ModalContainer from 'components/Modals/ModalContainer'
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon'
import CheckIcon from 'mdi-react/CheckIcon'
import CloseIcon from 'mdi-react/CloseIcon'
import Link from 'next/link'
import { format } from 'date-fns'

interface ConsentHistoryPageProps {
  jwt: string
  token: JWTSession
  unifiedApi: string
  provider: string
}

const ConsentHistoryPage = ({ jwt, token, unifiedApi, provider }: ConsentHistoryPageProps) => {
  const { session, setSession } = useSession()
  const { addToast } = useToast()
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [scopesModalData, setScopesModalData] = useState<DataScopesFields | null>(null)

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

  const { data: connectionData, error: connectionError } = useSWR(
    session?.jwt || jwt ? `/vault/connections/${unifiedApi}/${provider}` : null,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false
    }
  )

  const { data: consentData, error: consentHistoryError } = useSWR(
    session?.jwt || jwt ? `/vault/connections/${unifiedApi}/${provider}/consent` : null,
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false
    }
  )

  const connection: IConnection = connectionData?.data?.data
  const consents: ConsentRecord[] = consentData?.data?.data || []

  const { revokeConsent, loading } = useConsent({
    connection,
    token: session || token,
    jwt: session?.jwt || jwt
  })

  const handleRevoke = async () => {
    setShowRevokeModal(false)
    try {
      await revokeConsent()
      addToast({
        title: 'Access revoked',
        description: `Access to ${connection.name} has been revoked.`,
        type: 'success',
        autoClose: true
      })
    } catch (err) {
      addToast({
        title: 'Failed to revoke consent',
        description: 'Please try again.',
        type: 'error',
        autoClose: true
      })
    }
  }

  if (!connectionData && !connectionError && !session && !jwt) {
    return <ErrorBlock error={{ status: 401 }} />
  }

  if ((!connectionData && !connectionError) || (!consentData && !consentHistoryError)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (connectionError || !connection) {
    const errorObj = connectionError?.response ? connectionError.response : { status: 400 }
    return <ErrorBlock error={errorObj} token={session || token} />
  }

  return (
    <div>
      <div className="mb-4">
        <Link href={`/integrations/${unifiedApi}/${provider}`}>
          <button className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
            <ArrowLeftIcon className="mr-1" size={16} />
            <span>Back to integration</span>
          </button>
        </Link>
      </div>

      <div className="border rounded-md overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center">
            {connection.icon && (
              <img className="w-10 h-10 mr-4 rounded" src={connection.icon} alt={connection.name} />
            )}
            <div>
              <h1 className="text-xl font-medium text-gray-800">Consent History</h1>
              <p className="text-sm text-gray-600 mt-1">
                View all consent records for {connection.name}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t">
          {consents.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-500">
              <p>No consent history available</p>
            </div>
          ) : (
            <div className="divide-y">
              {consents.map((consent) => {
                const canShowScopes =
                  consent.granted && consent.resources && consent.resources !== '*'

                return (
                  <div
                    key={consent.id}
                    className={`px-5 py-4 hover:bg-gray-50 transition-colors${
                      canShowScopes ? ' cursor-pointer' : ''
                    }`}
                    onClick={
                      canShowScopes
                        ? () => setScopesModalData(consent.resources as DataScopesFields)
                        : undefined
                    }
                  >
                    <div
                      className={`flex items-center justify-between${
                        consent.granted ? ' mb-2' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        {consent.granted ? (
                          <div className="flex items-center text-green-600">
                            <div className="bg-green-100 rounded-full p-1 mr-2">
                              <CheckIcon size={16} />
                            </div>
                            <span className="font-medium">Granted</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <div className="bg-red-100 rounded-full p-1 mr-2">
                              <CloseIcon size={16} />
                            </div>
                            <span className="font-medium">Denied</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(consent.created_at), 'MMM dd, yyyy h:mm a')}
                      </span>
                    </div>

                    {consent.granted && (
                      <div className="text-sm text-gray-600 ml-7">
                        {getScopeSummary(consent.resources)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {connection.consent_state === 'granted' && (
          <div className="px-5 py-4 bg-gray-50 border-t">
            <Button
              variant="danger"
              text="Revoke Access"
              onClick={() => setShowRevokeModal(true)}
              disabled={loading}
            />
          </div>
        )}
      </div>

      {/* Scopes Detail Modal */}
      <ModalContainer open={!!scopesModalData} setOpen={() => setScopesModalData(null)} width={560}>
        <div className="px-5 py-4">
          <h2 className="font-medium">Granted Permissions</h2>
        </div>
        <div className="px-5 py-4 border-t">
          {scopesModalData && <ScopesList scopes={scopesModalData} />}
        </div>
        <div className="flex items-center justify-end px-5 py-2 border-t">
          <Button text="Close" onClick={() => setScopesModalData(null)} variant="outline" />
        </div>
      </ModalContainer>

      {/* Revoke Confirmation Modal */}
      <ModalContainer open={showRevokeModal} setOpen={setShowRevokeModal} width={410}>
        <div className="px-5 py-4">
          <h2 className="font-medium">Revoke Access?</h2>
        </div>
        <div
          className="px-5 py-8 text-gray-600 border-t border-b"
          style={{ fontSize: '0.9735rem' }}
        >
          Are you sure you want to revoke access? This will disable the integration and you will
          need to grant consent again to use it.
        </div>
        <div className="flex items-center justify-end px-5 py-2">
          <div className="mr-4">
            <Button text="Cancel" onClick={() => setShowRevokeModal(false)} variant="outline" />
          </div>
          <div>
            <Button text="Revoke" onClick={handleRevoke} variant="danger" isLoading={loading} />
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

export default ConsentHistoryPage
