export interface IAuthorizeResponse {
  status_code: number
  status: string
  data: { authorize_url: string }
}

export interface IConfirmResponse {
  status_code: number
  status: string
  data: { confirmed: boolean }
}
