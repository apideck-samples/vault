import { FormField } from './FormField'
import { RawJSON } from './RawJson'

export interface Settings extends RawJSON {
  instance_url?: string
  base_url?: string
}

export type ConnectionState = 'available' | 'added' | 'configured' | 'authorized' | 'callable'

export interface IConnection {
  id: string
  service_id: string
  unified_api: string
  auth_type: string | null
  name: string
  added: boolean
  icon: string
  logo?: string
  website?: string
  tag_line?: string
  authorize_url?: string
  revoke_url?: string | null
  state: ConnectionState
  configured: boolean
  enabled?: boolean
  settings?: Settings
  settings_required_for_authorization?: string[]
  configurable_resources: string[]
  configuration?: FormField[]
  form_fields: FormField[]
  created_at: number
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
