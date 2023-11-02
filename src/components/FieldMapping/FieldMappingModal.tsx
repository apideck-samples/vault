import { Button, useModal, useToast } from '@apideck/components'
import client from 'lib/axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { extractLastAttribute } from 'utils/extractLastAttribute'

import { CustomMapping, IConnection } from 'types/Connection'
import { useSession } from 'utils/useSession'
import FieldSelector from './FieldSelector'

export const findByDescription = (obj: any, description: string): any => {
  for (const key in obj) {
    if (obj[key] instanceof Object) {
      const result = findByDescription(obj[key], description)
      if (result) {
        return result
      }
    } else if (key === 'description' && obj[key] === description) {
      return obj
    }
  }
  return null
}

const renderReadableJSONPath = (jsonPath: string, responseDataPath?: string): string => {
  // Remove $ and [' from the beginning and '] from every part
  let parts: any = jsonPath?.match(/[^[\]'$]+/g) || []

  // If the first part equals the responseDataPath, remove the first part
  if (responseDataPath && parts[0] === responseDataPath) {
    parts = parts.slice(1)
  }

  // Join the parts with a dot
  return parts.length > 0 ? parts.join('.') : ''
}

const FieldMappingModal = ({
  connection,
  customMapping
}: {
  connection: IConnection
  customMapping: CustomMapping
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()
  const { session } = useSession()
  const { mutate } = useSWRConfig()
  const { removeModal } = useModal()
  const buttonRef = useRef<any>(null)

  const [selectedMapping, setSelectedMapping] = useState<{
    title: string
    description?: string
    example?: string
    type?: string
    finder?: string
  } | null>(null)

  const headers = useMemo(() => {
    return {
      Authorization: `Bearer ${session?.jwt}`,
      'X-APIDECK-APP-ID': `${session?.applicationId}`,
      'X-APIDECK-CONSUMER-ID': `${session?.consumerId}`
    }
  }, [session])

  const fetchResourceSchema = async (resource?: string) => {
    try {
      return await client.get(
        `/vault/connections/${connection.unified_api}/${connection.service_id}/${resource}/schema`,
        { headers }
      )
    } catch (error) {
      addToast({
        title: 'Failed to fetch schema',
        description: (error as Error)?.message,
        type: 'error'
      })
      return error
    }
  }

  const fetchCustomFields = async (resource?: string) => {
    try {
      return await client.get(
        `/vault/connections/${connection.unified_api}/${connection.service_id}/${resource}/custom-fields`,
        { headers }
      )
    } catch (error) {
      addToast({
        title: 'Failed to fetch custom fields',
        description: (error as Error)?.message,
        type: 'error'
      })
      return error
    }
  }

  const { data: schemaData } = useSWR(
    connection && !customMapping.custom_field && customMapping?.id && ['schema', customMapping?.id],
    () => fetchResourceSchema(customMapping?.id?.split('+')[1])
  )

  const { data: customFieldsData } = useSWR(
    connection &&
      customMapping.custom_field &&
      customMapping?.id && ['custom-fields', connection?.service_id, customMapping?.id],
    () => fetchCustomFields(customMapping?.id?.split('+')[1])
  )

  const schema = schemaData?.data?.data
  const schemaError = schemaData?.data?.error && schemaData?.data?.message
  const customFields = customFieldsData?.data?.data
  const customFieldsError = customFieldsData?.data?.error && customFieldsData?.data?.message
  const properties = schema?.properties
  const responseDataPath = schema?.response_data_path

  useEffect(() => {
    if (!selectedMapping) {
      if (customMapping?.value) {
        const mappingObject = findByDescription(properties, customMapping.value)

        const customField = customFields?.find((f: any) => f.finder === customMapping.value)

        if (!mappingObject && !customField) return

        setSelectedMapping({
          title: extractLastAttribute(customMapping.value, customMapping.custom_field),
          description: customMapping.custom_field ? customField.description : customMapping.value,
          type: customMapping.custom_field ? 'Custom field' : mappingObject?.type,
          example: customMapping.custom_field ? customField?.value : mappingObject?.example
        })
        return
      }
      buttonRef?.current?.focus()
    }
  }, [selectedMapping, properties, customMapping, customFields])

  const createCustomMapping = async () => {
    if (!connection || !selectedMapping) return

    try {
      setIsLoading(true)

      const url = `/vault/custom-mappings/${connection.unified_api}/${connection.service_id}/${customMapping.id}`
      const result = await client[customMapping?.value ? 'patch' : 'post'](
        url,
        {
          value: selectedMapping.finder || selectedMapping.description
        },
        { headers }
      )

      addToast({
        title: `Mapping ${customMapping?.value ? 'updated' : 'created.'}`,
        type: 'success'
      })

      const detailUrl = `/vault/connections/${connection?.unified_api}/${connection?.service_id}`
      const updatedConnection = {
        ...connection,
        custom_mappings:
          connection.custom_mappings?.map((f: CustomMapping) =>
            f.id === result?.data?.data?.id ? result.data.data : f
          ) || []
      }
      mutate(detailUrl, { data: { data: updatedConnection } }, { revalidate: false })
      removeModal()
    } catch (error) {
      addToast({
        title: 'Error',
        description: (error as Error).message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          createCustomMapping()
        }}
      >
        <div className="isolate mx-auto grid p-5 max-w-md grid-cols-1 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl xl:mx-0 xl:max-w-none lg:grid-cols-11">
          <div className="col-span-5">
            <div className="relative flex justify-start">
              <span className="bg-white px-1 text-sm text-gray-500 font-medium -mb-[9px] ml-5">
                Response key
              </span>
            </div>

            <div className="ring-1 ring-gray-200 rounded-2xl p-6  flex flex-col justify-between space-y-4 h-[192px]">
              <h2 className="text-gray-900 font-semibold">
                <div
                  className="flex items-center justify-between space-x-2.5 truncate"
                  style={{ minWidth: 170 }}
                >
                  {session?.theme?.logo && (
                    <img
                      src={session?.theme?.logo}
                      alt="logo"
                      className="w-7 h-7 rounded-full ring-2 ring-gray-100"
                    />
                  )}

                  {customMapping?.label || customMapping?.key}
                </div>
              </h2>
              <p className="text-sm text-gray-600 line-clamp-2 leading-6">
                {customMapping?.description || customMapping?.key}
              </p>
              <p className="flex items-baseline">
                <div className="inline-flex items-center px-2 py-1 text-xs font-medium text-center text-gray-600 bg-gray-50 ring-1 ring-gray-200/70 rounded-lg">
                  {`${customMapping.id.split('+')[0]} / ${customMapping.id.split('+')[1]}`}
                </div>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
          </div>
          <div className="col-span-5">
            <div className="relative flex justify-start">
              <span className="bg-white px-1 text-sm text-gray-500 font-medium -mb-[9px] ml-5 z-40">
                {`${connection?.name || 'Integration'} property`}
              </span>
            </div>
            <FieldSelector
              className="col-span-5"
              onSelect={(mappingField: any) => setSelectedMapping(mappingField)}
              isLoading={!schema && !customFields && !schemaError && !customFieldsError}
              error={schemaError || customFieldsError}
              buttonRef={buttonRef}
              customFields={customFields}
              connection={connection}
              triggerComponent={
                <OriginFieldCard
                  customMapping={customMapping}
                  connection={connection}
                  selectedMapping={selectedMapping}
                  responseDataPath={responseDataPath}
                />
              }
              triggerComponentProps={{
                className: 'text-left w-full h-full'
              }}
              responseDataPath={responseDataPath}
              properties={properties ? Object.entries(properties) : []}
              customMapping={customMapping}
            />
          </div>
        </div>
        <div className="p-3 px-5 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-end">
            <Button
              text="Cancel"
              className="inline-flex bg-white"
              variant="outline"
              onClick={() => removeModal()}
            />
            <Button
              text={'Save mapping'}
              type="submit"
              className="ml-3"
              isLoading={isLoading}
              disabled={isLoading}
              style={
                session?.theme?.primaryColor ? { backgroundColor: session?.theme.primaryColor } : {}
              }
            />
          </div>
        </div>
      </form>
    </div>
  )
}

type OriginFieldCardProps = {
  connection: IConnection | null
  selectedMapping: any
  customMapping: CustomMapping
  open?: boolean
  responseDataPath?: string
}

const OriginFieldCard = ({
  connection,
  customMapping,
  selectedMapping,
  open,
  responseDataPath
}: OriginFieldCardProps) => {
  const { session } = useSession()

  return (
    <div className="ring-1 ring-gray-200 rounded-2xl p-5 group shadow-sm hover:shadow-md transition duration-100 bg-white flex flex-col justify-between h-[192px]">
      <h2 className="text-gray-900 font-semibold">
        <div
          className="flex items-center justify-between space-x-2.5 truncate"
          style={{ minWidth: 170 }}
        >
          {session?.theme?.logo && (
            <img
              src={connection?.icon || connection?.logo}
              alt={connection?.id}
              className="w-7 h-7 rounded-full ring-2 ring-gray-100"
            />
          )}
          <div className="flex-1 truncate hidden sm:flex items-center justify-between">
            <span className="truncate">
              {!selectedMapping && customMapping?.value
                ? extractLastAttribute(customMapping.value?.toString(), customMapping.custom_field)
                : selectedMapping
                ? selectedMapping.title
                : customMapping?.custom_field
                ? 'Select custom field'
                : 'Select field'}
            </span>
            <div className="inline-flex items-center py-1 px-2.5 text-sm font-medium text-center text-gray-500 bg-gray-50 border border-gray-300/50 rounded-lg group-hover:bg-gray-100">
              <span className="text-gray-600 group-hover:text-gray-900 mr-1">Edit</span>
              {open ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="text-gray-600 group-hover:text-gray-900 transition duration-100 h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 15.75l7.5-7.5 7.5 7.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="text-gray-600 group-hover:text-gray-900 transition duration-100 h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </h2>
      {selectedMapping ? (
        <>
          <div>
            {(!!selectedMapping?.type || customMapping?.custom_field) && (
              <p className="text-sm text-gray-600 truncate leading-6">
                Type:{' '}
                <span className="text-gray-600">{selectedMapping?.type || 'Custom field'}</span>
              </p>
            )}
            {!!selectedMapping?.example && (
              <p className="text-sm text-gray-600 truncate leading-6 mb-1.5">
                Example:{' '}
                <span className="text-gray-600">{selectedMapping?.example?.toString()}</span>
              </p>
            )}
          </div>

          <p className="flex items-baseline">
            <div className="inline-flex items-center px-2 py-1 text-xs font-medium text-center text-gray-600 bg-gray-50 ring-1 ring-gray-200/70 rounded-lg overflow-y-auto hide-scrollbar">
              {customMapping.custom_field
                ? 'Custom Field'
                : renderReadableJSONPath(selectedMapping?.description, responseDataPath)}
            </div>
          </p>
        </>
      ) : (
        <>
          <div className="text-sm text-gray-600">
            {`Map a property to ${customMapping?.label || customMapping?.key}`}
          </div>
          <p className="flex items-baseline">
            <div className="inline-flex items-center px-2 py-1 text-xs font-medium text-center text-gray-600 bg-gray-50 ring-1 ring-gray-200/70 rounded-lg">
              None selected
            </div>
          </p>
        </>
      )}
    </div>
  )
}

export default FieldMappingModal
