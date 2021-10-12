import { JWTSession } from 'types/JWTSession'
import { applySession } from 'next-session'
import camelCaseKeys from 'camelcase-keys-deep'
import { decode } from 'jsonwebtoken'
import { options } from 'utils/sessionOptions'
import { useRouter } from 'next/router'

type IProps = { token: JWTSession }
const Session = ({ token }: IProps) => {
  const router = useRouter()

  if (token && typeof window !== 'undefined') {
    router.push('/')
  }

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

  return {
    props: {
      jwt: req.session.jwt,
      token: req.session.token
    }
  }
}

export default Session
