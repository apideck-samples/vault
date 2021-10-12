export interface JWTSession {
  applicationId: string
  consumerId: string
  consumerMetadata?: {
    accountName: string
    userName: string
    email: string
    image: string
  }
  exp: number
  iat: number
  hideResourceSettings: boolean
  redirectUri: string
  theme: Theme
  settings?: {
    showLogs?: boolean
    showSuggestions?: boolean
    sandboxMode?: boolean
    isolationMode?: boolean
  }
}

export interface Theme {
  vaultName: string
  favicon: string
  primaryColor: string
  termsUrl: string
  privacyUrl: string
  logo: string
  sidepanelBackgroundColor: string
  sidepanelTextColor: string
}
