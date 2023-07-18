import { Alert, Button, TextArea, TextInput, Toggle, useToast } from '@apideck/components'
import {
  ConfigurableResources,
  ConfirmModal,
  OAuthButtons,
  OAuthErrorAlert,
  SearchSelect
} from 'components'
import { Formik, FormikProps } from 'formik'
import { Fragment, useContext, useEffect, useState } from 'react'
import { IConnection, UpdateConnectionInput } from 'types/Connection'
import { JWTSession, Theme } from 'types/JWTSession'
import {
  OAuthError,
  SessionExpiredModalContext,
  ThemeContext,
  createOAuthErrorFromQuery
} from 'utils'

import { ConnectionBadge } from 'components/Connections'
import { IOptionType } from 'components/Inputs/SearchSelect'
import client from 'lib/axios'
import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon'
import CheckIcon from 'mdi-react/CheckIcon'
import ExternalLinkIcon from 'mdi-react/ExternalLinkIcon'
import HelpIcon from 'mdi-react/HelpCircleOutlineIcon'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FaExclamationTriangle } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import { mutate } from 'swr'
import { isActionAllowed } from 'utils/isActionAllowed'

interface IProps {
  connection: IConnection
  jwt: string
  token: JWTSession
}

const ConnectionFormFooter = ({
  connection,
  saved,
  formError,
  updateLoading,
  hasGuide
}: {
  connection: IConnection
  formError: boolean
  saved: boolean
  updateLoading: boolean
  hasGuide: boolean
}) => {
  if (formError) {
    return (
      <>
        <span className="mr-2 text-red-600">
          <AlertCircleIcon color="currentColor" size={20} />
        </span>
        <span className="text-red-600" style={{ fontSize: '0.9375rem' }}>
          Your changes could not be saved. Please try again.
        </span>
      </>
    )
  }

  if (updateLoading && connection.validation_support) {
    return (
      <>
        <span className="mr-2 text-main">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 p-1 text-gray-500 bg-white border border-gray-300 rounded-full animate-spin"
            fill="white"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </span>
        <span className="text-sm">Trying to connect to {connection.name}...</span>
      </>
    )
  }

  if (saved) {
    if (connection.state === 'invalid') {
      return (
        <>
          <span className="mr-2 text-red-600">
            <FaExclamationTriangle color="currentColor" />
          </span>
          <span className="text-sm">
            {' '}
            {hasGuide ? (
              <>
                Could not connect to {connection.name}. View our{' '}
                <a
                  className="inline-flex items-center text-main hover:text-main underline font-semibold"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://developers.apideck.com/connectors/${connection.service_id}/docs/consumer+connection`}
                >
                  Connection Guide
                  <ExternalLinkIcon size={16} />
                </a>{' '}
                for help
              </>
            ) : (
              `Could not connect to ${connection.name}, please check your credentials`
            )}
          </span>
        </>
      )
    } else {
      return (
        <>
          <span className="mr-2 text-main">
            <CheckIcon size={20} color="currentColor" />
          </span>
          <span className="text-sm">
            {connection.validation_support
              ? `Successfully connected to ${connection.name}`
              : 'Your changes have been saved'}
          </span>
        </>
      )
    }
  }

  if (hasGuide) {
    return (
      <div className="flex text-sm items-center text-gray-600">
        <HelpIcon className="mr-1" color="currentColor" size={20} />
        <span>
          Need help? View our{' '}
          <a
            className="inline-flex items-center text-main hover:text-main underline font-semibold"
            target="_blank"
            rel="noreferrer"
            href={`https://developers.apideck.com/connectors/${connection.service_id}/docs/consumer+connection`}
          >
            Connection Guide
            <ExternalLinkIcon size={16} />
          </a>
        </span>
      </div>
    )
  }

  return null
}

const ConnectionForm = ({ connection, token, jwt }: IProps) => {
  const [saved, setSaved] = useState(false)
  const [formError, setFormError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [authorizeLoading, setAuthorizeLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(false)
  const { addToast } = useToast()
  const { setSessionExpired } = useContext(SessionExpiredModalContext)
  const { primaryColor } = useContext(ThemeContext) as Theme
  const router = useRouter()
  const { query } = router
  const [oauthError, setOAuthError] = useState<OAuthError | null>(null)
  const isolationMode = token?.settings?.isolationMode
  const autoRedirect = token?.settings?.autoRedirect
  const hideResourceSettings = token?.settings?.hideResourceSettings

  useEffect(() => {
    setOAuthError(createOAuthErrorFromQuery(query))
  }, [query])

  const {
    name,
    icon,
    unified_api: unifiedApi,
    auth_type: authType,
    revoke_url: revokeUrl,
    authorize_url: authorizeUrl,
    form_fields: formFields,
    service_id: serviceId,
    has_guide: hasGuide
  } = connection

  const isAuthorized = connection.state === 'authorized' || connection.state === 'callable'

  let redirectUrl = `${window.location.origin}/integrations/${unifiedApi}/${serviceId}`

  if (autoRedirect || query?.redirectAfterAuthUrl) {
    const parsedRedirect = new URL(redirectUrl)
    parsedRedirect.searchParams.append(
      'redirectToAppUrl',
      autoRedirect ? token?.redirectUri : (query?.redirectAfterAuthUrl as string)
    )
    redirectUrl = parsedRedirect.href
  }

  let authorizeUrlWithRedirect = ''
  let revokeUrlWithRedirect = ''

  if (typeof authorizeUrl === 'string') {
    const parsedAuthorizeUrl = new URL(authorizeUrl as string)
    parsedAuthorizeUrl.searchParams.append('redirect_uri', redirectUrl)
    authorizeUrlWithRedirect = parsedAuthorizeUrl.href
  }
  if (isAuthorized && typeof revokeUrl === 'string') {
    const parsedRevokeUrl = new URL(revokeUrl)
    parsedRevokeUrl.searchParams.append('redirect_uri', redirectUrl)
    revokeUrlWithRedirect = parsedRevokeUrl.href
  }

  const initialValues = formFields.reduce((acc: any, formField) => {
    const { id, value } = formField
    acc[id] = value
    return acc
  }, {}) as Record<string, readonly string[]>
  const filteredFormFields = formFields.filter((field) => !field.hidden)

  const headers = {
    Authorization: `Bearer ${jwt}`,
    'X-APIDECK-APP-ID': token.applicationId,
    'X-APIDECK-CONSUMER-ID': token.consumerId
  }

  const isActionAllowedForSettings = isActionAllowed(token?.settings)

  const toggleConnection = async ({ id, enabled }: { id: string; enabled: boolean }) => {
    setUpdateLoading(true)
    await updateConnection({ id, enabled }, true)
    setUpdateLoading(false)
  }

  const updateConnection = async (values: Record<string, any>, isToggle?: boolean) => {
    setFormError(false)

    const { enabled, apiKey, ...rest } = values
    const body: UpdateConnectionInput = {
      enabled
    }

    if (!isToggle && Object.keys(rest).length !== 0) {
      body.settings = {}
      Object.keys(rest).forEach((setting) => {
        ;(body.settings as any)[setting] = rest[setting]
      })
    }

    try {
      setUpdateLoading(true)
      setSaved(false)
      const response = await client.patch(`/vault/connections/${unifiedApi}/${serviceId}`, body, {
        headers
      })
      await mutate(`/vault/connections/${unifiedApi}/${serviceId}`)
      mutate('/vault/connections')
      setUpdateLoading(false)
      setSaved(true)

      // Redirect back to application if redirectToAppUrl is present and state is callable
      const shouldRedirect =
        (autoRedirect || query.redirectToAppUrl || query.redirectAfterAuthUrl) && !isToggle
      if (shouldRedirect) {
        const redirectUrl = (query.redirectToAppUrl ||
          query.redirectAfterAuthUrl ||
          token?.redirectUri) as string
        const connection: IConnection = response?.data?.data
        if (connection?.state === 'callable') {
          addToast({
            title: 'Connection is ready',
            description: 'You will now get redirected back to the application.'
          })

          setTimeout(() => {
            const parsedRedirect = new URL(redirectUrl)
            parsedRedirect.searchParams.append('authorizedConnection', connection.service_id)
            window.location.href = parsedRedirect.href
          }, 3000)
        }
      }
    } catch (error) {
      setFormError(true)
      if (error?.response?.status === 401) {
        setSessionExpired(true)
      }
    }
  }

  const deleteConnection = async () => {
    setDeleteLoading(true)
    setDeleteError(false)

    try {
      await client.delete(`/vault/connections/${unifiedApi}/${serviceId}`, {
        headers
      })
      mutate('/vault/connections')
      addToast({
        title: `Integration successfully deleted`,
        description: 'You can re-add it anytime you want.',
        type: 'success',
        autoClose: true
      })
      router.push('/')
    } catch (error) {
      setDeleteError(true)
      if (error?.response?.status === 401) {
        setSessionExpired(true)
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  const authorizeConnection = async () => {
    if (connection.oauth_grant_type === 'authorization_code') {
      window.location.href = authorizeUrlWithRedirect
      return
    }

    try {
      setAuthorizeLoading(true)
      await client
        .post(`/vault/connections/${unifiedApi}/${serviceId}/token`, {}, { headers })
        .finally(() => {
          setAuthorizeLoading(false)
        })
      mutate(`/vault/connections/${unifiedApi}/${serviceId}`)
      mutate('/vault/connections')
      addToast({
        title: `Integration successfully authorized`,
        type: 'success',
        autoClose: true
      })
    } catch (error) {
      addToast({
        title: `Something went wrong`,
        description: `The integration could not be authorized. Please make sure your settings are correct and try again.`,
        type: 'error',
        autoClose: true
      })
    }
  }

  const renderBackButton = () => {
    if (router?.query?.isolation || isolationMode) {
      if (router?.query?.redirectAfterAuthUrl) {
        return (
          <a
            href={router.query.redirectAfterAuthUrl as string}
            className="inline-flex items-center self-start justify-start text-sm leading-none text-gray-600 group hover:text-gray-800"
            style={{ height: '24px' }}
          >
            <ArrowLeftIcon
              className="mr-1 transition duration-150 ease-in-out"
              color="currentColor"
              size={16}
            />
            <span className="transition duration-150 ease-in-out">Return to application</span>
          </a>
        )
      } else {
        return null
      }
    }

    return (
      <Link href="/">
        <button
          className="inline-flex items-center self-start justify-start text-sm leading-none text-gray-600 group hover:text-gray-800"
          style={{ height: '24px' }}
        >
          <ArrowLeftIcon
            className="mr-1 transition duration-150 ease-in-out"
            color="currentColor"
            size={16}
          />
          <span className="transition duration-150 ease-in-out">Integrations</span>
        </button>
      </Link>
    )
  }

  return (
    <Fragment>
      <div className="flex items-center justify-between mb-4">
        {renderBackButton()}
        <div className="block md:hidden lg:block xl:hidden">
          <ConnectionBadge connection={connection} />
        </div>
      </div>

      {oauthError && <OAuthErrorAlert error={oauthError} />}

      {connection.integration_state === 'needs_configuration' && (
        <Alert
          className="text-left mb-4"
          description={
            <span>
              Configure the {connection.name} integration in the{' '}
              <a
                href={`https://platform.apideck.com/configuration/${connection.unified_api}/${connection.service_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                Apideck admin dashboard
              </a>{' '}
              before linking your account. This integration will not be visible to your users until
              configured.
            </span>
          }
          title="Admin configuration required"
          variant="warning"
        />
      )}

      <div className="border rounded-md">
        <div className="flex justify-between px-3 py-4 sm:px-4 md:px-5 items-top">
          <div className="flex justify-start items-top">
            <img className="w-8 h-8 mr-2 rounded sm:w-10 sm:h-10 sm:mr-4" src={icon} alt={name} />
            <div>
              <h1 className="font-medium text-gray-800 text-md md:text-xl">{name}</h1>
              <div className="text-sm text-gray-700 capitalize">{`${unifiedApi} Connection`}</div>
            </div>
          </div>
          <div className="flex items-center h-12 space-x-2 md:space-x-3">
            <div className="hidden md:block lg:hidden xl:block">
              <ConnectionBadge connection={connection} showConfig={false} />
            </div>
            {isActionAllowedForSettings('disable') && (
              <Toggle
                isEnabled={connection.enabled}
                isLoading={updateLoading}
                onToggle={() =>
                  toggleConnection({ id: connection.id, enabled: !connection.enabled })
                }
                className="inline-block"
              />
            )}
            {isActionAllowedForSettings('delete') && (
              <Button variant="danger-outline" text="Delete" onClick={() => setModalOpen(true)} />
            )}
          </div>
        </div>
        {(authType === 'oauth2' || authType === 'session') && (
          <OAuthButtons
            connection={connection}
            isLoading={authorizeLoading}
            isAuthorized={isAuthorized}
            onAuthorize={authorizeConnection}
            revokeUrl={revokeUrlWithRedirect}
            token={token}
          />
        )}
      </div>

      {isAuthorized && connection?.configurable_resources?.length > 0 && !hideResourceSettings && (
        <div className="mt-10">
          <ConfigurableResources connection={connection} token={token} jwt={jwt} />
        </div>
      )}

      {filteredFormFields.length > 0 && (
        <Formik
          onSubmit={(values) => updateConnection(values)}
          initialValues={initialValues}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {(formikProps: FormikProps<Record<string, readonly string[]>>) => {
            const { handleSubmit, isSubmitting, handleBlur, handleChange, values } = formikProps

            return (
              <form className="mt-10 border rounded-md" onSubmit={handleSubmit}>
                <div className="px-5 py-4">
                  <h2 className="font-medium">Settings</h2>
                </div>
                <div className="px-5 py-6 bg-gray-100 border-t border-b">
                  {filteredFormFields.map((field) => {
                    const {
                      id,
                      label,
                      required,
                      placeholder,
                      prefix,
                      suffix,
                      description,
                      disabled,
                      type,
                      options,
                      allow_custom_values: allowCustomValues,
                      sensitive
                    } = field

                    return (
                      <div key={id} className="items-start justify-center mb-4 md:flex">
                        <div className="w-full py-2 pr-2 text-sm font-medium md:text-right md:w-1/3">
                          {label}
                          {required && <span className="ml-1 text-red-600">*</span>}
                        </div>
                        <input name="enabled" value="true" type="hidden" readOnly />
                        <div className="w-full md:pl-2 md:w-2/3">
                          {(type === 'text' || type === 'password') && (
                            <TextInput
                              name={id}
                              value={(values[id] as any) || ''}
                              type={type}
                              required={required}
                              placeholder={placeholder}
                              prepend={prefix}
                              append={suffix}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              valid={connection.state === 'invalid' && saved ? false : undefined}
                              sensitive={type === 'password' || sensitive}
                              canBeCopied={type === 'password' || sensitive}
                              data-testid={id}
                            />
                          )}
                          {type === 'select' && (
                            <SearchSelect
                              field={id}
                              value={values[id]}
                              handleChange={handleChange}
                              disabled={disabled}
                              options={options as IOptionType[]}
                              placeholder={disabled ? 'Available after authorization' : 'Select..'}
                              isCreatable={allowCustomValues}
                            />
                          )}
                          {type === 'textarea' && (
                            <TextArea
                              name={id}
                              value={(values[id] as any) || ''}
                              required={required}
                              placeholder={placeholder}
                              onChange={handleChange}
                            />
                          )}
                          {description && (
                            <small className="inline-block mt-2 text-gray-600">
                              <ReactMarkdown>{description}</ReactMarkdown>
                            </small>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between px-5 py-2">
                  <div className="flex items-center justify-start">
                    <ConnectionFormFooter
                      connection={connection}
                      formError={formError}
                      hasGuide={hasGuide}
                      saved={saved}
                      updateLoading={updateLoading}
                    />
                  </div>
                  <div className="flex items-center justify-start"></div>
                  <Button
                    type="submit"
                    text="Save"
                    isLoading={isSubmitting}
                    style={primaryColor ? { backgroundColor: primaryColor } : {}}
                  />
                </div>
              </form>
            )
          }}
        </Formik>
      )}

      <ConfirmModal
        open={modalOpen}
        setOpen={setModalOpen}
        onConfirm={() => deleteConnection()}
        title={`Delete ${name} integration`}
        loading={deleteLoading}
        error={deleteError}
      />
    </Fragment>
  )
}

export default ConnectionForm
