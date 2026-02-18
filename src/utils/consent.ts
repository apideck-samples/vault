import { IConnection, DataScopesFields, ConsentRecord } from 'types/Connection'

/**
 * Check if connection has applicable data scopes enabled
 */
export const hasApplicableScopes = (connection: IConnection): boolean => {
  const appScopes = connection?.application_data_scopes
  if (!appScopes?.enabled) return false

  if (appScopes.resources === '*') return true

  if (typeof appScopes.resources === 'object' && Object.keys(appScopes.resources).length > 0) {
    return true
  }

  return false
}

/**
 * Check if consent is required before showing connection details
 */
export const requiresConsent = (connection: IConnection): boolean => {
  if (!hasApplicableScopes(connection)) return false

  const state = connection.consent_state
  return (
    state === 'pending' ||
    state === 'requires_reconsent' ||
    state === 'denied' ||
    state === 'revoked'
  )
}

/**
 * Get scopes that need re-consent (new fields)
 */
export const getNewScopes = (
  applicationScopes: DataScopesFields,
  grantedScopes: DataScopesFields | '*'
): DataScopesFields => {
  if (grantedScopes === '*') return {}

  const newScopes: DataScopesFields = {}

  Object.keys(applicationScopes).forEach((resource) => {
    const appFields = applicationScopes[resource]
    const grantedFields = grantedScopes[resource] || {}

    Object.keys(appFields).forEach((field) => {
      const appScope = appFields[field]
      const grantedScope = grantedFields[field]

      const isNew = !grantedScope
      const readExpanded = appScope.read && !grantedScope?.read
      const writeExpanded = appScope.write && !grantedScope?.write

      if (isNew || readExpanded || writeExpanded) {
        if (!newScopes[resource]) newScopes[resource] = {}
        newScopes[resource][field] = appScope
      }
    })
  })

  return newScopes
}

/**
 * Format resource name (e.g., "hris.employees" -> "Employees")
 */
export const formatResourceName = (resource: string): string => {
  const parts = resource.split('.')
  const name = parts[parts.length - 1] // Get last part after dot
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format field name (e.g., "first_name" -> "First Name")
 */
export const formatFieldName = (field: string): string => {
  return field
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get scope summary for display (e.g., "3 resources, 12 fields")
 */
export const getScopeSummary = (resources: ConsentRecord['resources']): string => {
  if (resources === '*') return 'All data access'

  if (typeof resources === 'object' && resources !== null) {
    const resourceCount = Object.keys(resources).length
    const fieldCount = Object.values(resources).reduce(
      (acc, resource) => acc + Object.keys(resource).length,
      0
    )
    return `${resourceCount} resource${resourceCount !== 1 ? 's' : ''}, ${fieldCount} field${
      fieldCount !== 1 ? 's' : ''
    }`
  }

  return 'No scope specified'
}
