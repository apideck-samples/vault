import { JWTSession } from 'types/JWTSession'
import camelcaseKeysDeep from 'camelcase-keys-deep'
import { decode } from 'jsonwebtoken'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'utils/useSession'

type IProps = { jwt: string | null; token?: JWTSession | null }
const Session = ({ jwt, token }: IProps) => {
  const router = useRouter()
  const { setSession } = useSession()

  useEffect(() => {
    if (token && jwt) {
      setSession({ ...token, jwt })
      router.push('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div />
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export async function getServerSideProps({ query }: any): Promise<any> {
  const { jwt } = query

  let token
  if (jwt) {
    const decoded = decode(jwt) as JWTSession
    if (decoded) {
      token = camelcaseKeysDeep(decoded)
    }
  }

  return {
    props: {
      jwt: jwt || null,
      token: token || null
    }
  }
}

export default Session
