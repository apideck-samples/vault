export interface JWTSession {
  applicationId: string
  consumerId: string
  consumerMetadata?: {
    account_name: string
    user_name: string
    image: string
  }
  exp: number
  iat: number
  redirectUri: string
  theme: {
    favicon: string
    logo?: string
    primary_color: string
    privacy_url: string
    sidepanel_background_color: string
    sidepanel_text_color: string
    terms_url: string
    vault_name: string
  }
}
