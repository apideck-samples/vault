export interface IAuthorizeRequest {
  nonce: string
  redirect_uri: string
}

export interface IAuthorizeResponse {
  authorize_url: string
}

export interface IConfirmRequest {
  confirm_token: string
}

export interface IConfirmResponse {
  status_code: number
  status: string
  data: { confirmed: boolean }
}

export interface IOAuthCompleteMessage {
  type: 'oauth_complete'
  nonce: string
  confirmToken: string
  serviceId: string
  success: true
}

export interface IOAuthErrorMessage {
  type: 'oauth_error'
  error: string
  errorDescription: string
  serviceId: string
}
