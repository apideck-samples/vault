import { Button, TextInput, useToast } from '@apideck/components'
import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react'

import { ErrorBlock } from 'components'
import { HiArrowRight } from 'react-icons/hi'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import Radar from 'components/Suggestions/Radar'
import StepLayout from 'components/Suggestions/StepLayout'
import { Transition } from '@headlessui/react'
import { applySession } from 'next-session'
import client from 'lib/axios'
import { isEmailProvider } from 'utils/isEmailProvider'
import { options } from 'utils/sessionOptions'
import { useRouter } from 'next/router'
import useSWR from 'swr'

interface IProps {
  jwt: string
  token: JWTSession
}

const DiscoverPage = ({ jwt, token }: IProps) => {
  const [domain, setDomain] = useState<string>()
  const { push } = useRouter()
  const consumer = token?.consumerMetadata
  const { addToast } = useToast()

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-APIDECK-APP-ID': token?.applicationId,
        'X-APIDECK-CONSUMER-ID': token?.consumerId
      }
    })
  }

  const { data, error } = useSWR('/vault/connections', fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  })

  const connections: IConnection[] = data?.data?.data

  useEffect(() => {
    // Check if userName or AccountName is an email address
    const regex = /\S+@\S+\.\S+/
    if (
      consumer?.user_name &&
      regex.test(consumer.user_name) &&
      !isEmailProvider(consumer.user_name)
    ) {
      // Set domain if userName is a business email address
      setDomain(consumer.user_name.substring(consumer.user_name.lastIndexOf('@') + 1))
    }

    if (
      consumer?.account_name &&
      regex.test(consumer?.account_name) &&
      !isEmailProvider(consumer.account_name)
    ) {
      // Set domain if accountName is a business email address
      setDomain(consumer.account_name.substring(consumer.account_name.lastIndexOf('@') + 1))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getTech = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!domain?.length) {
      addToast({ title: 'Please enter a domain', description: '', type: 'warning' })
      return
    }
    if (domain.includes('/')) {
      addToast({
        title: 'Please only add the domain',
        description: `Example: salesforce.com`,
        type: 'warning'
      })
      return
    }
    push(`/suggestions/${domain}`)
  }

  if (!data && error) {
    const errorObj = error?.response ? error.response : { status: 400 }
    return <ErrorBlock error={errorObj} token={token} />
  }

  return (
    <StepLayout stepIndex={0}>
      <div className="flex items-center justify-center max-w-3xl mx-auto bg-white">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-medium tracking-tight text-center text-gray-900 sm:text-2xl">
            {`Let's get started`}
          </h1>
          <p className="max-w-md mb-8 text-lg tracking-tight text-gray-900 sm:text-xl">
            We use technographics to suggest relevant integrations based on your domain.
          </p>
          <form onSubmit={getTech}>
            <TextInput
              name="domain"
              value={domain}
              placeholder="yourdomain.com"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDomain(e.currentTarget.value)}
              className="block max-w-xs mx-auto mb-6"
            />
            <Button size="large" type="submit">
              Continue <HiArrowRight className="ml-2" />
            </Button>
          </form>
        </div>
      </div>
      <div className="relative">
        <div className="absolute inset-x-0 z-10 hidden h-16 pointer-events-none lg:block bg-gradient-to-b from-white" />
        <Transition
          show={connections?.length > 0}
          enter="transition ease-out duration-500"
          enterFrom="transform opacity-10"
          enterTo="transform opacity-100"
          leave="transition ease-in duration-500"
          leaveFrom="transform opacity-100"
          leaveTo="transform opacity-0"
        >
          <Radar connections={connections} />
        </Transition>
      </div>
    </StepLayout>
  )
}

export const getServerSideProps = async ({ req, res }: any): Promise<any> => {
  await applySession(req, res, options)

  return {
    props: {
      jwt: req.session?.jwt || '',
      token: req.session?.token || {}
    }
  }
}

export default DiscoverPage
