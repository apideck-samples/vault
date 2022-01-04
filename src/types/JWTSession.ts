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
  hideResourceSettings: boolean
  redirectUri: string
  theme: Theme
  settings?: {
    autoRedirect?: boolean
    showLogs?: boolean
    showSuggestions?: boolean
    sandboxMode?: boolean
    isolationMode?: boolean
    unifiedApis?: string[]
  }
}

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
