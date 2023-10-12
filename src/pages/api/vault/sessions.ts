import { VercelRequest, VercelResponse } from '@vercel/node'

import fetch from 'node-fetch'
import { headers } from '../_utils'

export default async function (req: VercelRequest, res: VercelResponse) {
  const { body } = req
  const raw = await fetch(`${process.env.NEXT_PUBLIC_UNIFY_API_URL}/vault/sessions`, {
    method: 'POST',
    headers,
    body
  })
  const response = await raw.json()
  res.json(response)
}
