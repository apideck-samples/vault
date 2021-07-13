import { VercelRequest, VercelResponse } from '@vercel/node'

import fetch from 'node-fetch'

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  if (req?.query?.domain) {
    const domain = req?.query?.domain
    const raw = await fetch(
      `${process.env.NEXT_PUBLIC_APIDECK_CLOUD_CATALOG_API_URL}/cloud-services/${domain}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_APIDECK_CLOUD_CATALOG_API_KEY || ''
        }
      }
    )
    const response = await raw.json()
    res.json(response?.data?.technologies || [])
  }
}
