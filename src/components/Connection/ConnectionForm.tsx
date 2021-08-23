import { Button, TextInput, Toggle, useToast } from '@apideck/components'
import {
  ConfigurableResources,
  ConfirmModal,
  OAuthButtons,
  OAuthErrorAlert,
  SearchSelect
} from 'components'
import { ConnectionBadge } from 'components/Connections'
import { IOptionType } from 'components/Inputs/SearchSelect'
import { Formik, FormikProps } from 'formik'
import client from 'lib/axios'
import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon'
import CheckIcon from 'mdi-react/CheckIcon'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useContext, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { mutate } from 'swr'
import { IConnection, UpdateConnectionInput } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import {
  createOAuthErrorFromQuery,
  OAuthError,
  SessionExpiredModalContext,
  ThemeContext,
  ThemeContextType
} from 'utils'

interface IProps {
  connection: IConnection
  jwt: string
  token: JWTSession
}

const ConnectionForm = ({ connection, token, jwt }: IProps) => {
  const [saved, setSaved] = useState(false)
  const [formError, setFormError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(false)
  const { addToast } = useToast()
  const { setSessionExpired } = useContext(SessionExpiredModalContext)
  const { primary_color } = useContext(ThemeContext) as ThemeContextType
  const router = useRouter()
  const { query } = router
  const [oauthError, setOAuthError] = useState<OAuthError | null>(null)

  useEffect(() => {
    setOAuthError(createOAuthErrorFromQuery(query))
  }, [query])

  const {
    name,
    icon,
    unified_api: unifiedApi,
    tag_line: tagLine,
    auth_type: authType,
    revoke_url: revokeUrl,
    authorize_url: authorizeUrl,
    form_fields: formFields,
    service_id: serviceId
  } = connection

  const isAuthorized = connection.state === 'authorized' || connection.state === 'callable'

  const redirectUrl = `${window.location.origin}/integrations/${unifiedApi}/${serviceId}`
  const authorizeUrlWithRedirect = `${authorizeUrl}&redirect_uri=${redirectUrl}`
  let revokeUrlWithRedirect = ''

  if (isAuthorized) {
    revokeUrlWithRedirect = `${revokeUrl}&redirect_uri=${redirectUrl}`
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

  const toggleConnection = async ({ id, enabled }: { id: string; enabled: boolean }) => {
    setUpdateLoading(true)
    await updateConnection({ id, enabled })
    setUpdateLoading(false)
  }

  const updateConnection = async (values: Record<string, any>) => {
    setFormError(false)

    const { enabled, apiKey, ...rest } = values
    const body: UpdateConnectionInput = {
      settings: {},
      enabled
    }

    if (Object.keys(rest).length !== 0) {
      Object.keys(rest).forEach((setting) => {
        ;(body.settings as any)[setting] = rest[setting]
      })
    }

    try {
      await client.patch(`/vault/connections/${unifiedApi}/${serviceId}`, body, {
        headers
      })
      mutate('/vault/connections')
      setSaved(true)
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
      router.push('/')
      addToast({
        title: `Integration successfully deleted`,
        description: 'You can re-add it anytime you want.',
        type: 'success',
        autoClose: true
      })
    } catch (error) {
      setDeleteError(true)
      if (error?.response?.status === 401) {
        setSessionExpired(true)
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <Fragment>
      <div className="flex items-center justify-between mb-4">
        {!router?.query?.isolation && (
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
        )}
        <div className="block md:hidden lg:block xl:hidden">
          <ConnectionBadge connection={connection} />
        </div>
      </div>

      {oauthError && <OAuthErrorAlert error={oauthError} />}

      <div className="border rounded-md">
        <div className="flex justify-between px-3 py-4 sm:px-4 md:px-5 items-top">
          <div className="flex justify-start items-top">
            <img className="w-8 h-8 mr-2 rounded sm:w-10 sm:h-10 sm:mr-4" src={icon} alt={name} />
            <div>
              <h1 className="font-medium text-gray-800 text-md md:text-xl">{name}</h1>
              <div className="text-sm text-gray-700 capitalize">{`${unifiedApi} integration`}</div>
            </div>
          </div>
          <div className="flex items-center h-12">
            <div className="hidden md:block lg:hidden xl:block">
              <ConnectionBadge connection={connection} />
            </div>
            <Toggle
              isEnabled={connection.enabled}
              isLoading={updateLoading}
              onToggle={() => toggleConnection({ id: connection.id, enabled: !connection.enabled })}
              className="inline-block mx-2 md:mx-3"
            />
            <Button variant="danger-outline" text="Delete" onClick={() => setModalOpen(true)} />
          </div>
        </div>
        <div className="flex justify-between px-3 py-4 sm:px-4 md:px-5 items-top">
          {tagLine && <p className="hidden my-3 mr-4 text-sm text-gray-800 md:block">{tagLine}</p>}
        </div>
        {tagLine && (
          <p className="px-3 pb-3 text-sm text-gray-800 sm:px-4 sm:pb-4 md:hidden">{tagLine}</p>
        )}
        {authType === 'oauth2' && (
          <OAuthButtons
            connection={connection}
            isAuthorized={isAuthorized}
            authorizeUrl={authorizeUrlWithRedirect}
            revokeUrl={revokeUrlWithRedirect}
          />
        )}
      </div>

      {isAuthorized &&
        connection?.configurable_resources?.length > 0 &&
        !token.hideResourceSettings && (
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
                      description,
                      disabled,
                      type,
                      options
                    } = field

                    return (
                      <div key={id} className="items-start justify-center mb-4 md:flex">
                        <div className="w-full py-2 pr-2 text-sm font-medium md:text-right md:w-1/3">
                          {label}
                          {required && <span className="ml-1 text-red-600">*</span>}
                        </div>
                        <input name="enabled" value="true" type="hidden" readOnly />
                        <div className="w-full md:pl-2 md:w-2/3">
                          {type === 'text' && (
                            <TextInput
                              name={id}
                              value={(values[id] as any) || ''}
                              type="text"
                              required={required}
                              placeholder={placeholder}
                              onChange={handleChange}
                              onBlur={handleBlur}
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
                    {saved && (
                      <Fragment>
                        <span className="mr-2 text-main">
                          <CheckIcon size={20} color="currentColor" />
                        </span>
                        <span className="text-sm">Your changes have been saved.</span>
                      </Fragment>
                    )}
                    {formError && (
                      <Fragment>
                        <span className="mr-2 text-red-600">
                          <AlertCircleIcon color="currentColor" size={20} />
                        </span>
                        <span className="text-red-600" style={{ fontSize: '0.9375rem' }}>
                          Your changes could not be saved. Please try again.
                        </span>
                      </Fragment>
                    )}
                  </div>
                  <Button
                    type="submit"
                    text="Save"
                    isLoading={isSubmitting}
                    style={primary_color ? { backgroundColor: primary_color } : {}}
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
