import { FC, useState } from 'react'
import { DataScopesFields } from 'types/Connection'
import { formatResourceName, formatFieldName } from 'utils/consent'
import classNames from 'classnames'

interface ScopesListProps {
  scopes: DataScopesFields
  highlightedScopes?: DataScopesFields
}

export const ScopesList: FC<ScopesListProps> = ({ scopes, highlightedScopes = {} }) => {
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set())

  const toggleResource = (resource: string) => {
    const newExpanded = new Set(expandedResources)
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource)
    } else {
      newExpanded.add(resource)
    }
    setExpandedResources(newExpanded)
  }

  const isHighlighted = (resource: string, field: string) => {
    return !!highlightedScopes[resource]?.[field]
  }

  return (
    <div className="space-y-2">
      {Object.keys(scopes).map((resource) => {
        const fields = scopes[resource]
        const fieldCount = Object.keys(fields).length
        const isExpanded = expandedResources.has(resource)

        return (
          <div key={resource} className="border rounded-md overflow-hidden">
            <button
              onClick={() => toggleResource(resource)}
              className="w-full px-4 py-3 bg-white hover:bg-gray-50 text-left flex items-center justify-between transition-colors"
              type="button"
            >
              <span className="font-medium text-gray-800">{formatResourceName(resource)}</span>
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-2">
                  {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
                </span>
                <svg
                  className={classNames('w-5 h-5 text-gray-400 transition-transform', {
                    'transform rotate-180': isExpanded
                  })}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 py-2 bg-white divide-y overflow-y-auto max-h-80 border-t">
                {Object.keys(fields).map((field) => {
                  const scope = fields[field]
                  const highlighted = isHighlighted(resource, field)

                  return (
                    <div
                      key={field}
                      className={classNames(
                        'py-3 flex items-center justify-between',
                        highlighted && 'bg-yellow-50 -mx-4 px-4'
                      )}
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {formatFieldName(field)}
                        {highlighted && (
                          <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </span>

                      <div className="flex space-x-2">
                        {scope.read && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Read
                          </span>
                        )}
                        {scope.write && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Write
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
