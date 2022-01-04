import { JWTSession } from 'types/JWTSession'
import { applySession } from 'next-session'
import camelCaseKeys from 'camelcase-keys-deep'
import { decode } from 'jsonwebtoken'
import { options } from 'utils/sessionOptions'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'utils/useSession'

type IProps = { token: JWTSession }
const Session = ({ token }: IProps) => {
  const router = useRouter()
  const { setSession } = useSession()

  if (token && typeof window !== 'undefined') {
    router.push('/')
  }

  useEffect(() => {
    if (token) {
      setSession(token)
      router.push('/')
    }
  }, [router, token, setSession])

  return <div />
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export async function getServerSideProps({ req, res, query }: any): Promise<any> {
  await applySession(req, res, options)

  const { jwt } = query
  req.session.jwt = jwt

  const decoded = decode(jwt) as JWTSession
  if (decoded) {
    req.session.token = camelCaseKeys(decoded)
  }

  if (!req.session.token) return { props: {} }

  return {
    props: {
      jwt: req.session.jwt,
      token: req.session.token
    }
  }
}

export default Session
