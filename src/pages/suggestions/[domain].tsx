import { Button, useToast } from '@apideck/components'
import classNames from 'classnames'
import { ErrorBlock } from 'components'
import LoadingSuggestionCard from 'components/Suggestions/LoadingSuggestionCard'
import StepLayout from 'components/Suggestions/StepLayout'
import SuggestionCard from 'components/Suggestions/SuggestionCard'
import client from 'lib/axios'
import { applySession } from 'next-session'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { HiArrowRight } from 'react-icons/hi'
import useSWR from 'swr'
import { IConnection } from 'types/Connection'
import { JWTSession } from 'types/JWTSession'
import { options } from 'utils/sessionOptions'

interface IProps {
  jwt: string
  token: JWTSession
  domain: string
}

const DiscoverDomainPage = ({ jwt, token, domain }: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [suggestions, setSuggestions] = useState<null | IConnection[]>()
  const { addToast } = useToast()
  const { push } = useRouter()

  const fetcher = (url: string) => {
    return client.get(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-APIDECK-APP-ID': token?.applicationId,
        'X-APIDECK-CONSUMER-ID': token?.consumerId
      }
    })
  }

  const { data, mutate, error } = useSWR('/vault/connections', fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  })

  const connections: IConnection[] = data?.data?.data

  useEffect(() => {
    const getTech = () => {
      setIsLoading(true)
      fetch(`/api/technographics/${domain}`)
        .then((response) => response.json())
        .then((data) => setSuggestions(data))
        .catch(() => {
          addToast({
            title: `Fetching suggestions failed`,
            description: 'Please try again later',
            type: 'error'
          })
          push('/')
        })
        .finally(() => setIsLoading(false))
    }

    if (domain && connections?.length) getTech()
  }, [addToast, domain, push, connections?.length])

  const toggleConnection = async (connection: IConnection, enabled: boolean) => {
    try {
      await client.patch(
        `/vault/connections/${connection.unified_api}/${connection.service_id}`,
        { enabled },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            'X-APIDECK-APP-ID': token.applicationId,
            'X-APIDECK-CONSUMER-ID': token.consumerId
          }
        }
      )
      mutate()
    } catch (error) {
      addToast({
        title: `Updating connection failed`,
        description: error?.message,
        type: 'error'
      })
    }
  }

  const finishSteps = () => {
    const enabledConnections = connections.filter((con) => con.enabled)
    if (enabledConnections.length) {
      addToast({
        title: `Well done!`,
        description: `You have ${enabledConnections.length} enabled integration${
          enabledConnections.length > 1 ? 's' : ''
        }`,
        type: 'success',
        autoClose: true
      })
    }
    push('/')
  }

  const matchedConnections = suggestions
    ?.map((suggestion) => connections?.filter((con) => con.service_id === suggestion?.id))
    .flat()
    .filter(Boolean)

  const loadingConnections = !data && !error
  const loading = isLoading || loadingConnections
  if (error) {
    const errorObj = error?.response ? error.response : { status: 400 }
    return <ErrorBlock error={errorObj} token={token} />
  }

  return (
    <StepLayout stepIndex={1}>
      <div className="flex items-center justify-center px-2">
        <div className="text-center ">
          <h1 className="mb-4 text-2xl font-medium tracking-tight text-center text-gray-900 sm:text-2xl">
            {!loading && !matchedConnections?.length ? 'No suggestions found' : ''}
            {loading || matchedConnections?.length ? 'Integration suggestions' : ''}
          </h1>

          <p className="max-w-md mx-auto mb-8 text-md tracking-tight text-gray-600 sm:text-lg">
            {loading ? 'Searching for relative suggestions...' : ''}
            {!loading && matchedConnections?.length
              ? 'Select the integrations you would like to enable.'
              : ''}
            {!loading && !connections?.length
              ? 'It seems like you have not added any connectors.'
              : ''}
          </p>

          <div
            className={classNames('grid mb-8 text-center', {
              'grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-0':
                !loading && matchedConnections?.length === 1,
              'grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-4 xl:gap-6':
                !loading && matchedConnections?.length === 2,
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-4 xl:gap-6':
                loading || (matchedConnections?.length && matchedConnections?.length > 2)
            })}
          >
            {loading && !matchedConnections
              ? [...Array(9).keys()].map((key) => <LoadingSuggestionCard key={key} />)
              : ''}
            {!loading &&
              matchedConnections?.map((connection, i) => {
                const delay = Math.max(0, i * 20)
                return (
                  <SuggestionCard
                    connection={connection}
                    toggleConnection={toggleConnection}
                    key={connection?.id}
                    delay={delay}
                  />
                )
              })}
          </div>
        </div>
      </div>
      {!loading ? (
        <div className="w-full text-center">
          <Button size="large" type="button" onClick={finishSteps}>
            Continue <HiArrowRight className="ml-2" />
          </Button>
        </div>
      ) : (
        ''
      )}
    </StepLayout>
  )
}

export const getServerSideProps = async ({ req, res, params }: any): Promise<any> => {
  await applySession(req, res, options)

  return {
    props: {
      jwt: req.session?.jwt || '',
      token: req.session?.token || {},
      domain: params.domain || ''
    }
  }
}

export default DiscoverDomainPage
