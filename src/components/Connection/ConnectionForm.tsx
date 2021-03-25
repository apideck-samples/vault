import { Button } from '@apideck/components'
import {
  ConfigurableResources,
  ConfirmModal,
  ErrorBlock,
  OAuthButtons,
  OAuthErrorAlert,
  Select,
  TextInput
} from 'components'
import { Formik, FormikProps } from 'formik'
import client from 'lib/axios'
import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon'
import CheckIcon from 'mdi-react/CheckIcon'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment, useContext, useEffect, useState } from 'react'
import { IConnection, UpdateConnectionInput } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import {
  createOAuthErrorFromQuery,
  isConnected,
  OAuthError,
  SessionExpiredModalContext,
  ThemeContext,
  ThemeContextType
} from 'utils'

interface IProps {
  connection: IConnection
  jwt: string
  token: JWTSession
  handleSubmit: (connection: IConnection) => void
  handleDelete: (connection: IConnection) => void
}

const ConnectionForm = ({ connection, token, jwt, handleSubmit, handleDelete }: IProps) => {
  const [saved, setSaved] = useState(false)
  const [formError, setFormError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [deleteError, setDeleteError] = useState(false)
  const { setSessionExpired } = useContext(SessionExpiredModalContext)
  const { primary_color } = useContext(ThemeContext) as ThemeContextType
  const router = useRouter()
  const { query } = router
  const [oauthError, setOAuthError] = useState<OAuthError | null>(null)

  useEffect(() => {
    setOAuthError(createOAuthErrorFromQuery(query))
  }, [query])

  if (!connection) {
    const error = {
      status: 404
    }
    return <ErrorBlock error={error} />
  }

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

  const isAuthorized = isConnected(connection)

  const redirectUrl = `${window.location.origin}/integrations/${unifiedApi}/${serviceId}`
  const authorizeUrlWithRedirect = `${authorizeUrl}&redirect_uri=${redirectUrl}`
  let revokeUrlWithRedirect = ''

  if (isAuthorized) {
    revokeUrlWithRedirect = `${revokeUrl}&redirect_uri=${redirectUrl}`
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialValues = formFields.reduce((acc: any, formField) => {
    const { id, value } = formField
    acc[id] = value
    return acc
  }, {}) as Record<string, readonly string[]>

  const headers = {
    Authorization: `Bearer ${jwt}`,
    'X-APIDECK-APP-ID': token.applicationId,
    'X-APIDECK-CONSUMER-ID': token.consumerId
  }

  const updateConnection = async (values: Record<string, string | boolean | unknown>) => {
    setFormError(false)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { enabled, apiKey, ...rest } = values
    const body: UpdateConnectionInput = {
      settings: {},
      enabled: true
    }

    if (Object.keys(rest).length !== 0) {
      Object.keys(rest).forEach((setting) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(body.settings as any)[setting] = rest[setting]
      })
    }

    try {
      const { data } = await client.patch(`/vault/connections/${unifiedApi}/${serviceId}`, body, {
        headers
      })
      handleSubmit(data)
      setSaved(true)
    } catch (error) {
      setFormError(true)

      const { response } = error
      const { status } = response

      if (status === 401) {
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

      const updatedConnection = {
        ...connection,
        added: false,
        enabled: false
      }

      handleDelete(updatedConnection)

      setDeleteSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error) {
      setDeleteError(true)

      const { response } = error
      const { status } = response

      if (status === 401) {
        setSessionExpired(true)
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <Fragment>
      {!router?.query?.isolation && (
        <Link href="/">
          <button
            className="inline-flex items-center self-start justify-start mb-4 text-sm leading-none text-gray-600 group hover:text-gray-800"
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

      {oauthError && <OAuthErrorAlert error={oauthError} />}

      <div className="border rounded-md">
        <div className="flex justify-between px-5 py-4 items-top">
          <div className="flex justify-start items-top">
            <img className="mr-4" style={{ width: '40px', height: '40px' }} src={icon} alt={name} />
            <div>
              <h1 className="text-xl font-medium text-gray-800">{name}</h1>
              <div className="text-sm text-gray-700 capitalize">{`${unifiedApi} integration`}</div>

              {tagLine && (
                <p className="pt-4 my-4 mr-4 text-sm text-gray-800 border-t">{tagLine}</p>
              )}
            </div>
          </div>
          <div>
            <Button variant="danger-outline" text="Delete" onClick={() => setModalOpen(true)} />
          </div>
        </div>
        {authType === 'oauth2' && (
          <OAuthButtons
            connection={connection}
            isAuthorized={isAuthorized}
            authorizeUrl={authorizeUrlWithRedirect}
            revokeUrl={revokeUrlWithRedirect}
          />
        )}
      </div>

      {isAuthorized && connection?.configurable_resources?.length > 0 && (
        <div className="mt-10">
          <ConfigurableResources connection={connection} token={token} jwt={jwt} />
        </div>
      )}

      {formFields.length > 0 && (
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
                  {formFields.map((field) => {
                    const { id, label, required, placeholder, description, type, options } = field

                    return (
                      <div key={id} className="flex items-start justify-center mb-4">
                        <div className="w-1/3 pt-2 pr-2 text-sm font-medium text-right">
                          {label}
                          {required && <span className="ml-1 text-red-600">*</span>}
                        </div>
                        <div className="w-2/3 pl-2">
                          {type === 'text' && (
                            <TextInput
                              name={id}
                              value={values[id]}
                              type="text"
                              required={required}
                              placeholder={placeholder}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                          )}
                          {type === 'select' && (
                            <Select
                              field={id}
                              required={required}
                              options={options}
                              formikProps={formikProps}
                            />
                          )}
                          {description && (
                            <small className="inline-block mt-2 text-gray-600">{description}</small>
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
        success={deleteSuccess}
        error={deleteError}
      />
    </Fragment>
  )
}

export default ConnectionForm
