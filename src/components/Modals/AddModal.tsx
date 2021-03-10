import { Button } from '@apideck/components'
import { SelectInput } from 'components'
import { IOptionType } from 'components/Inputs/SelectInput'
import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import { useRouter } from 'next/router'
import { Fragment, useContext, useEffect, useState } from 'react'
import { IConnection, UpdateConnectionInput } from 'types/Connection'
import { ThemeContext, ThemeContextType } from 'utils'
import ModalContainer from './ModalContainer'

interface IProps {
  open: boolean
  setOpen: (input: boolean) => void
  unifiedApi: string
  availableConnections: IConnection[]
  updateConnection: (
    data: UpdateConnectionInput,
    successCallback: () => void,
    ErrorCallback: () => void
  ) => void
}

const AddModal = ({
  open,
  setOpen,
  unifiedApi,
  availableConnections = [],
  updateConnection
}: IProps) => {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
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
      router.push(`/integrations/${unifiedApi}/${value}`)
    }

    const errorCallback = () => {
      setLoading(false)
      setError(true)
    }

    updateConnection(
      { unifiedApi, serviceId: value, enabled: true },
      successCallback,
      errorCallback
    )
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

  const handleChange = (option: IOptionType | null) => {
    if (option?.value) setValue(option.value)
  }

  return (
    <ModalContainer open={open} setOpen={setOpen}>
      <div className="px-5 py-4">
        <h2 className="font-medium">Add {unifiedApi} integration</h2>
      </div>
      <div className="px-5 pt-10 pb-12 bg-gray-100 border-t border-b">
        <div className="mb-1 text-sm font-medium">Integration</div>
        <SelectInput
          field="connection"
          value={value}
          options={connectionsOptions}
          handleChange={(option) => {
            handleChange(option)
          }}
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
              isDisabled={!value}
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
