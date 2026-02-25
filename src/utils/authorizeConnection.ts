import client from 'lib/axios'

interface AuthorizeResponse {
  authorize_url: string
}

export const authorizeConnection = async (
  unifiedApi: string,
  serviceId: string,
  nonce: string,
  headers: Record<string, string>
): Promise<AuthorizeResponse> => {
  const response = await client.post(
    `/vault/connections/${unifiedApi}/${serviceId}/authorize`,
    { nonce },
    { headers }
  )
  return response.data.data
}
