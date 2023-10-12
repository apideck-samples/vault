import { Button, useModal, useToast } from '@apideck/components'
import client from 'lib/axios'
import { useState } from 'react'
import { useSWRConfig } from 'swr'
import { IConnection } from 'types/Connection'
import { extractLastAttribute } from 'utils/extractLastAttribute'
import { useSession } from 'utils/useSession'
import FieldMappingModal from './FieldMappingModal'

const CustomMappings = ({ connection }: { connection: IConnection }) => {
  const { session } = useSession()
  const [deletingMappingId, setDeletingMappingId] = useState<string | null>(null)
  const { addToast } = useToast()
  const { addModal } = useModal()
  const { mutate } = useSWRConfig()

  const deleteCustomMapping = async (id: string) => {
    try {
      setDeletingMappingId(id)

      const url = `/vault/custom-mappings/${connection.unified_api}/${connection.service_id}/${id}`
      await client.delete(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.jwt}`,
          'X-APIDECK-APP-ID': `${session?.applicationId}`,
          'X-APIDECK-CONSUMER-ID': `${session?.consumerId}`
        }
      })
      addToast({
        title: 'Mapping removed.',
        type: 'success'
      })
      const detailUrl = `/vault/connections/${connection?.unified_api}/${connection?.service_id}`
      mutate(detailUrl)
    } catch (error) {
      addToast({
        title: 'Error',
        description: (error as Error).message,
        type: 'error'
      })
    } finally {
      setDeletingMappingId(null)
    }
  }

  return (
    <div className="overflow-hidden p-5">
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-10">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-10">
            <table className="min-w-full divide-y divide-gray-200 border bg-white">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-5"
                  >
                    Response key
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    {`${connection?.name || 'Integration'} property`}
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {connection?.custom_mappings.map((mapping) => (
                  <tr key={mapping?.key} className="even:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-5">
                      <code style={{ fontWeight: 600 }}>{mapping?.label || mapping?.key}</code>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="text-xs text-gray-600 font-medium">
                        {mapping?.value ? (
                          <code className="font-semibold">
                            {extractLastAttribute(mapping.value, mapping.custom_field)}
                          </code>
                        ) : (
                          <span className="text-red-600">Not mapped</span>
                        )}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                      <div className="flex items-center space-x-2 justify-end">
                        {mapping?.value && (
                          <button
                            className="inline-flex items-center p-1.5 text-sm font-medium text-center text-gray-500 bg-gray-100 ring-1 ring-gray-300/60 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-50"
                            onClick={() => {
                              addModal(
                                <FieldMappingModal
                                  customMapping={mapping}
                                  connection={connection}
                                />,
                                {
                                  className: '!max-w-[50rem] overflow-visible',
                                  onClose: () => console.log(`Don't close`),
                                  style: { overflow: 'visible', padding: 0 }
                                }
                              )
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>
                        )}
                        {mapping?.value && mapping.consumer_id && (
                          <button
                            className="inline-flex items-center p-1.5 text-sm font-medium text-center text-gray-500 bg-gray-100 ring-1 ring-gray-300/60 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-50"
                            onClick={() => deleteCustomMapping(mapping.id)}
                          >
                            {deletingMappingId === mapping.id ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-4 w-4 animate-spin"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            )}
                          </button>
                        )}
                        {!mapping?.value && (
                          <Button
                            size="small"
                            onClick={() => {
                              addModal(
                                <FieldMappingModal
                                  customMapping={mapping}
                                  connection={connection}
                                />,
                                {
                                  className: '!max-w-[50rem] overflow-visible',
                                  onClose: () => console.log(`Don't close`),
                                  style: { overflow: 'visible', padding: 0 }
                                }
                              )
                            }}
                          >
                            Map field
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomMappings
