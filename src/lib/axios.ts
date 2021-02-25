import axios from 'axios'

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_UNIFY_API_URL,
  headers: {
    'X-APIDECK-AUTH-TYPE': 'JWT'
  }
})

export default client
