import { Button, TextInput, useDebounce } from '@apideck/components'
import { Menu, Transition } from '@headlessui/react'
import classNames from 'classnames'

import Fuse from 'fuse.js'
import {
  ChangeEvent,
  Fragment,
  RefObject,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

interface Props {
  onSelect: (field: any) => void
  properties: any
  isLoading: boolean
  triggerComponent?: any
  triggerComponentProps?: any
  className?: string
  buttonRef?: any
  customFields: any
  responseDataPath?: string
  selectedCustomMapping?: any
  error?: string
}

const FieldSelector = ({
  onSelect,
  properties: propertiesProps,
  isLoading,
  triggerComponent,
  triggerComponentProps,
  className = '',
  customFields,
  buttonRef,
  responseDataPath,
  selectedCustomMapping,
  error
}: Props) => {
  const [selectedObjectProperty, setSelectedObjectProperty] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const isCustomFieldMapping = !!customFields?.length
  const [mode, setMode] = useState<'custom' | 'root' | 'advanced'>(
    isCustomFieldMapping ? 'custom' : 'root'
  )
  const [list, setList] = useState<any>([])
  const debouncedSearchTerm = useDebounce(searchTerm, 250)
  const [fieldMappingString, setFieldMappingString] = useState()
  const [properties, setProperties] = useState<any>(propertiesProps)
  const searchInputRef: any = useRef()

  useEffect(() => {
    if (debouncedSearchTerm) {
      const mapped = properties.map((p: any) => {
        return {
          name: p[0],
          value: p[1]
        }
      })

      const fuse = new Fuse(mapped, {
        keys: ['name'],
        threshold: 0.4
      })
      const results = fuse.search(debouncedSearchTerm)

      let propResults = {}
      results.forEach((result: Fuse.FuseResult<any>) => {
        propResults = { ...propResults, [result.item.name]: result.item.value }
      })

      setList(Object.keys(propResults)?.length ? Object.entries(propResults) : [])
    }
    searchInputRef?.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm])

  const propsToShow = searchTerm.length ? list : properties

  useEffect(() => {
    if (
      responseDataPath &&
      responseDataPath === propertiesProps?.[0]?.[0] &&
      propertiesProps?.[0]?.[1]?.properties
    ) {
      // Skip the first data path
      const nestedProperties = Object.entries(propertiesProps?.[0]?.[1]?.properties)
      setProperties(nestedProperties)
    } else {
      setProperties(propertiesProps)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertiesProps])

  useEffect(() => {
    if (isCustomFieldMapping && mode !== 'custom') setMode('custom')
    if (!isCustomFieldMapping && mode !== 'root') setMode('root')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCustomFieldMapping])

  const renderMenuItem = ({ title, type, properties, items, description, finder, value }: any) => {
    const isSelectable =
      (type === 'array' && !items?.properties) || // array of strings, numbers, etc.
      (type !== 'array' && type !== 'object' && type !== 'anyOf')

    if (items?.anyOf) {
      const anyOfItem = {
        title,
        type: 'anyOf',
        properties: items.anyOf?.map((option: any, i: number) => ({
          ...option,
          title: `${title}: type ${i + 1}`
        }))
      }

      return renderMenuItem(anyOfItem)
    }

    return (
      <Menu.Item>
        {({ active }) => (
          <button
            type="button"
            className={`${
              active ? 'bg-primary-500 text-white' : 'text-gray-900'
            } group flex w-full items-center px-4 py-2.5 justify-between`}
            onClick={(e) => {
              if (isSelectable) {
                onSelect({
                  isCustomFieldMapping,
                  description,
                  finder,
                  title,
                  type,
                  example: typeof value === 'string' ? value : undefined
                })
                return
              }
              e.preventDefault()
              setSelectedObjectProperty({
                title,
                properties: items?.properties || properties,
                previousObjectProperty: selectedObjectProperty
              })
            }}
          >
            <div className="flex flex-col items-start truncate">
              <span className="font-semibold text-sm">{title}</span>
              <span className={`italic text-xs ${active ? 'text-primary-200' : 'text-gray-500'}`}>
                {isCustomFieldMapping ? <span>Example: {value}</span> : type}
              </span>
            </div>
            {!isSelectable && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            )}
          </button>
        )}
      </Menu.Item>
    )
  }

  /* If selectedObjectProperty is present, we only want to render the items inside of that object */
  const propertiesToRender = useMemo(
    () =>
      selectedObjectProperty ? Object.entries(selectedObjectProperty.properties) : propsToShow,
    [selectedObjectProperty, propsToShow]
  )

  const sortedProperties = useMemo(
    () =>
      propertiesToRender.sort((a: any, b: any) => {
        return a[0].localeCompare(b[0])
      }),
    [propertiesToRender]
  )

  const sortedCustomFields = useMemo(() => {
    const fields = customFields ?? []
    return [...fields]?.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id))
  }, [customFields])

  const noFieldsFound = mode !== 'advanced' && !isLoading && !propertiesToRender?.length

  const tabs = [
    ...(isCustomFieldMapping
      ? [
          {
            id: 'custom',
            name: 'Select field',
            current: mode === 'custom'
          }
        ]
      : [
          {
            id: 'root',
            name: 'Select field',
            current: mode === 'root'
          }
        ]),
    {
      id: 'advanced',
      name: 'Advanced',
      current: mode === 'advanced'
    }
  ]

  return (
    <Menu
      as="div"
      className={classNames('relative w-full text-left z-10', className)}
      id="field-selector"
    >
      {({ open }) => (
        <Fragment>
          {triggerComponent ? (
            <Menu.Button {...triggerComponentProps} ref={buttonRef}>
              {cloneElement(triggerComponent, { open })}
            </Menu.Button>
          ) : (
            <Menu.Button className="inline-flex w-full justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
              Select field
            </Menu.Button>
          )}

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Menu.Items
              className="absolute rounded-t-2xl z-30 mt-2 w-[calc(100%-0px)] left-[0px] origin-top-right overflow-hidden bg-white shadow-lg ring-1 ring-gray-200 rounded-b-2xl focus:outline-none"
              style={{ top: -200, minHeight: 150 }}
            >
              <div className="max-h-[380px] xl:max-h-[420px] 2xl:max-h-[480px] overflow-y-auto divide-y divide-gray-200">
                <nav className="flex items-center justify-between" aria-label="Tabs">
                  <div className="-mb-px flex space-x-6 border-b px-4">
                    {tabs.map((tab: any) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setMode(tab.id)
                          if (tab.id === 'advanced' && selectedCustomMapping) {
                            setFieldMappingString(selectedCustomMapping.value)
                          } else {
                            setFieldMappingString(undefined)
                          }

                          if (
                            tab.id === 'advanced' &&
                            !selectedCustomMapping?.value &&
                            selectedObjectProperty?.properties
                          ) {
                            const firstProperty: any = Object.entries(
                              selectedObjectProperty.properties
                            )?.[0]
                            const description = firstProperty?.[1]?.description
                            const fieldMappingStringWithoutLastPart = description
                              ?.split('[')
                              ?.slice(0, -1)
                              ?.join('[')

                            if (fieldMappingStringWithoutLastPart) {
                              setFieldMappingString(fieldMappingStringWithoutLastPart)
                            }
                          }
                        }}
                        type="button"
                        className={classNames(
                          tab.current
                            ? 'border-primary-500 text-primary-600 font-medium'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                          'group inline-flex items-center py-3 mt-1 border-b-2 text-sm'
                        )}
                      >
                        <span>{tab.name}</span>
                      </button>
                    ))}
                  </div>
                  <Menu.Item>
                    <button
                      type="button"
                      className="flex items-center justify-center px-5 pl-8 group"
                    >
                      {open ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="text-gray-400 group-hover:text-gray-900 transition duration-100 h-5 w-5"
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
                          className="text-gray-400 group-hover:text-gray-900 transition duration-100 h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      )}
                    </button>
                  </Menu.Item>
                </nav>

                {mode === 'advanced' && (
                  <div className="mb-3 px-4">
                    <div className="mt-3">
                      <label
                        htmlFor="fieldMapping"
                        className="block text-sm font-medium leading-5 text-gray-700"
                      >
                        Enter a field mapping.
                      </label>
                      <TextInput
                        placeholder="$['address']['example']"
                        className="mt-1"
                        name="fieldMapping"
                        value={fieldMappingString}
                        onChange={(e: any) => setFieldMappingString(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Menu.Item>
                          <Button
                            text="Confirm"
                            size="small"
                            className="mt-2"
                            disabled={!fieldMappingString}
                            onClick={() => {
                              onSelect({
                                title: fieldMappingString,
                                mode: 'manual',
                                description: fieldMappingString
                              })
                            }}
                          />
                        </Menu.Item>
                      </div>
                    </div>
                  </div>
                )}

                {/* If selectedObjectProperty is not null, render a back button */}
                {mode === 'root' && selectedObjectProperty ? (
                  <Menu.Item as="div" className="px-4">
                    {({ active }) => (
                      <button
                        className={`${
                          active ? '' : 'text-gray-900 rounded-lg'
                        } group flex w-full fade-left items-center mt-2.5 px-2 hover:bg-gray-100 py-2 mb-2 text-sm font-semibold border-b text-gray-900 hover:text-gray-600 border bg-gray-50 rounded-md sm:text-sm focus:ring-transparent border-gray-200`}
                        onClick={(e) => {
                          e.preventDefault()
                          setSelectedObjectProperty(selectedObjectProperty?.previousObjectProperty)
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="h-4 w-4 mx-1 mr-2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                          />
                        </svg>
                        {selectedObjectProperty?.title}
                      </button>
                    )}
                  </Menu.Item>
                ) : (
                  mode !== 'advanced' &&
                  (!noFieldsFound || searchTerm?.length > 0) && (
                    <div className="px-3 py-3">
                      <SearchInput
                        value={searchTerm}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setSearchTerm(event.target.value)
                        }
                        searchInputRef={searchInputRef}
                        autoFocus={true}
                        placeholder={mode === 'root' ? 'Search properties' : 'Search fields'}
                      />
                    </div>
                  )
                )}
                {mode === 'root' &&
                  sortedProperties?.map((property: { [key: string]: any }, index: number) =>
                    renderMenuItem({
                      title: property[0],
                      ...property[1],
                      index
                    })
                  )}
                {mode === 'custom' &&
                  sortedCustomFields.map((field) =>
                    renderMenuItem({
                      title: field?.name || field?.id,
                      description: field?.finder,
                      ...field
                    })
                  )}
                {error && mode !== 'advanced' && (
                  <div className="p-3 py-5 text-sm text-red-500">{error}</div>
                )}
                {isLoading && !properties?.length && mode !== 'advanced' && (
                  <div className="mx-3">
                    {[...new Array(6).keys()]?.map((i: number) => {
                      return (
                        <div
                          className="bg-gray-300 h-6 group flex w-full items-center rounded my-2 animate-pulse"
                          key={i}
                        />
                      )
                    })}
                  </div>
                )}
                {mode === 'root' && noFieldsFound && !error && (
                  <div className="p-3 py-5 text-sm text-gray-500">No fields found for mapping.</div>
                )}
                {mode === 'custom' && customFields?.length === 0 && !error && (
                  <div className="p-3 py-5 text-sm text-gray-500">
                    No custom fields found for mapping.
                  </div>
                )}
              </div>
            </Menu.Items>
          </Transition>
        </Fragment>
      )}
    </Menu>
  )
}

interface SearchInputProps {
  value: string
  searchInputRef: RefObject<HTMLInputElement>
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  autoFocus?: boolean
  placeholder?: string
}

const SearchInput = ({
  value,
  searchInputRef,
  onChange,
  autoFocus,
  placeholder = 'Search connectors'
}: SearchInputProps) => {
  return (
    <div className="relative fade-in">
      <div className="absolute left-0 flex items-center pt-[11px] pl-2.5 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <input
        name="search"
        type="text"
        ref={searchInputRef}
        placeholder={placeholder}
        value={value}
        className="w-full text-gray-600 border bg-gray-100 rounded-md sm:text-sm focus:ring-transparent border-gray-100 focus:border-gray-200 placeholder-gray-400 pl-8"
        autoComplete="off"
        onChange={onChange}
        data-testid="search-input"
        autoFocus={autoFocus}
      />
    </div>
  )
}

export default FieldSelector
