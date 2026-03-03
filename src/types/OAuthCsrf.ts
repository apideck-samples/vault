export interface IAuthorizeResponse {
  authorize_url: string
}

export interface IConfirmResponse {
  status_code: number
  status: string
  data: { confirmed: boolean }
}
