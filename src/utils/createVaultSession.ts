export const createVaultSession = async (url?: string) => {
  const response = await fetch('/api/vault/sessions', {
    method: 'POST',
    body: JSON.stringify({
      redirect_uri: url || window.location.href,
      consumer_metadata: {
        account_name: 'test@salesforce.com',
        user_name: 'Test User',
        image: 'https://unavatar.now.sh/jake'
      },
      settings: {
        sandbox_mode: true,
        allow_actions: ['delete', 'disconnect', 'reauthorize', 'disable']
      }
    })
  })
  return response.json()
}
