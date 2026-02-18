import { FormField } from './FormField'
import { RawJSON } from './RawJson'

export interface Settings extends RawJSON {
  instance_url?: string
  base_url?: string
}

export type ConnectionState = 'available' | 'added' | 'authorized' | 'callable' | 'invalid'
export type IntegrationState = 'configured' | 'needs_configuration' | 'disabled'
export type OauthGrantType = 'client_credentials' | 'authorization_code'

// Consent-related types
export type ConsentState =
  | 'implicit' // Grandfathered access for existing connections
  | 'pending' // New connection awaiting consent decision
  | 'granted' // User explicitly approved scopes
  | 'denied' // User explicitly rejected scopes
  | 'revoked' // User revoked previously granted consent
  | 'requires_reconsent' // Scope expansion detected, re-auth needed

export interface DataScopesField {
  read: boolean
  write: boolean
}

export type DataScopesFields = Record<string, Record<string, DataScopesField>>

export interface DataScopes {
  enabled: boolean
  updated_at?: string
  resources: '*' | DataScopesFields // '*' = all fields allowed
}

export interface ConsentRecord {
  id: string
  created_at: string
  granted: boolean
  resources: '*' | DataScopesFields
}

export interface IConnection {
  id: string
  service_id: string
  unified_api: string
  auth_type: string | null
  oauth_grant_type?: OauthGrantType
  name: string
  icon: string
  logo?: string
  website?: string
  tag_line?: string
  authorize_url?: string
  revoke_url?: string | null
  state: ConnectionState
  integration_state: IntegrationState
  enabled?: boolean
  has_guide: boolean
  validation_support: boolean
  settings?: Settings
  settings_required_for_authorization?: string[]
  configurable_resources: string[]
  resource_schema_support: string[]
  configuration?: FormField[]
  form_fields: FormField[]
  created_at: number
  custom_mappings: CustomMapping[]
  consent_state?: ConsentState
  consents?: ConsentRecord[]
  latest_consent?: ConsentRecord
  application_data_scopes?: DataScopes
}

export interface UpdateConnectionInput {
  enabled: boolean
  settings?: Settings
}

export interface UpdateConnectionConfigInput {
  configuration: ResourceConfig[]
}

export interface ResourceConfig {
  resource: string
  defaults: Partial<FormField>[]
}

export interface CustomMapping {
  description: string
  id: string
  key: string
  label: string
  required: false
  value: string
  consumer_id?: string
  custom_field?: boolean
}
