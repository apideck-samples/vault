export interface JWTSession {
  applicationId: string
  consumerId: string
  consumerMetadata?: {
    accountName?: string
    userName?: string
    email?: string
    image?: string
  }
  exp: number
  iat: number
  redirectUri: string
  theme: Theme
  settings?: SessionSettings
  jwt?: string
}

export interface SessionSettings {
  hideResourceSettings?: boolean
  autoRedirect?: boolean
  hideConsumerCard?: boolean
  showLogs?: boolean
  showSuggestions?: boolean
  showSidebar?: boolean
  sandboxMode?: boolean
  isolationMode?: boolean
  unifiedApis?: string[]
  hideGuides?: boolean
  allowActions?: VaultAction[]
}

export type VaultAction = 'delete' | 'disconnect' | 'reauthorize' | 'disable'

export interface Theme {
  vaultName?: string
  favicon?: string
  primaryColor?: string
  termsUrl?: string
  privacyUrl?: string
  sidepanelBackgroundColor?: string
  sidepanelTextColor?: string
  logo?: string
}
