import { Button, TextInput } from '@apideck/components'
import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react'

import { JWTSession } from 'types/JWTSession'
import StepLayout from 'components/Suggestions/StepLayout'
import { applySession } from 'next-session'
import { options } from 'utils/sessionOptions'
import { useRouter } from 'next/router'

interface IProps {
  jwt: string
  token: JWTSession
}

const DiscoverPage = ({ token }: IProps) => {
  const [domain, setDomain] = useState<string>()
  const { push } = useRouter()

  const consumer = token?.consumerMetadata

  useEffect(() => {
    if (consumer?.user_name?.includes('@'))
      setDomain(consumer.user_name.substring(consumer.user_name.lastIndexOf('@') + 1))
    if (consumer?.account_name?.includes('@'))
      setDomain(consumer.account_name.substring(consumer.account_name.lastIndexOf('@') + 1))
  }, [consumer])

  const getTech = async (e: SyntheticEvent) => {
    e.preventDefault()
    push(`/discover/${domain}`)
  }

  return (
    <StepLayout prevPath="/" nextPath={`/discover/${domain}`} stepIndex={0}>
      <div className="flex items-center justify-center max-w-3xl">
        <div className="text-center">
          <p className="max-w-sm mb-6 text-lg font-medium tracking-tight text-gray-500 sm:text-xl">
            Enter your domain and we will provide you with some suggestions.
          </p>
          <form onSubmit={getTech}>
            <TextInput
              name="domain"
              value={domain}
              placeholder="apideck.com"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDomain(e.currentTarget.value)}
              className="block max-w-xs mx-auto mb-6"
            />
            <Button text="Continue" size="large" type="submit" />
          </form>
        </div>
      </div>
    </StepLayout>
  )
}

export const getServerSideProps = async ({ req, res }: any): Promise<any> => {
  await applySession(req, res, options)

  return {
    props: {
      token: req.session?.token || {}
    }
  }
}

export default DiscoverPage
