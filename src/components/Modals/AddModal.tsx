import { Button, useToast } from '@apideck/components'
import { Fragment, useContext, useEffect, useState } from 'react'
import { ThemeContext, ThemeContextType } from 'utils'

import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import { IConnection } from 'types/Connection'
import { IOptionType } from 'components/Inputs/SearchSelect'
import ModalContainer from './ModalContainer'
import { SearchSelect } from 'components'
import { useRouter } from 'next/router'

interface IProps {
  open: boolean
  setOpen: (input: boolean) => void
  unifiedApi: string
  availableConnections: IConnection[]
  createConnection: (
    data: { unifiedApi: string; serviceId: string },
    successCallback: () => void,
    ErrorCallback: () => void
  ) => void
}

const AddModal = ({
  open,
  setOpen,
  unifiedApi,
  availableConnections = [],
  createConnection
}: IProps) => {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const { addToast } = useToast()
  const { primary_color } = useContext(ThemeContext) as ThemeContextType
  const connectionsOptions = availableConnections.map((connection) => {
    const { id, name, service_id: serviceId, icon } = connection

    return {
      id,
      label: name,
      value: serviceId,
      icon
    }
  })
  const handleClick = () => {
    setLoading(true)
    setError(false)

    const successCallback = () => {
      setLoading(false)
      setOpen(false)
      addToast({
        title: `Integration successfully added`,
        description: `You can now authorize it and manage integration settings.`,
        type: 'success',
        autoClose: true
      })
      router.push(`/integrations/${unifiedApi}/${value}`)
    }

    const errorCallback = () => {
      setLoading(false)
      setError(true)
    }

    createConnection({ unifiedApi, serviceId: value }, successCallback, errorCallback)
  }

  useEffect(() => {
    if (!open) {
      // reset state when modal is closed
      // add a little timeout to wait after animation is done
      setTimeout(() => {
        setValue('')
        setError(false)
        setLoading(false)
      }, 600)
    }
  }, [open])

  return (
    <ModalContainer open={open} setOpen={setOpen}>
      <div className="px-5 py-4">
        <h2 className="font-medium">Add {unifiedApi} integration</h2>
      </div>
      <div className="px-5 pt-10 pb-12 bg-gray-100 border-t border-b">
        <div className="mb-1 text-sm font-medium">Integration</div>
        <SearchSelect
          field="connection"
          value={value}
          options={connectionsOptions as IOptionType[]}
          handleChange={(e: any) => setValue(e.currentTarget.value)}
          placeholder="Select.."
        />
      </div>
      <div className="flex items-center justify-between px-5 py-2">
        <div className="flex items-center">
          {error && (
            <Fragment>
              <span className="mr-2 text-red-600">
                <AlertCircleIcon color="currentColor" size={20} />
              </span>
              <span className="text-red-600" style={{ fontSize: '0.9375rem' }}>
                Could not add integration. Please try again.
              </span>
            </Fragment>
          )}
        </div>
        <div className="flex items-center">
          <div className="mr-4">
            <Button
              text="Cancel"
              onClick={() => setOpen(false)}
              variant="outline"
              className="w-20"
            />
          </div>
          <div>
            <Button
              text="Add"
              isLoading={loading}
              disabled={!value}
              onClick={() => handleClick()}
              className="w-20"
              style={primary_color ? { backgroundColor: primary_color } : {}}
            />
          </div>
        </div>
      </div>
    </ModalContainer>
  )
}

export default AddModal
