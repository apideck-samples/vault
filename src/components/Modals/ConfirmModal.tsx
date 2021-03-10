import { Button } from '@apideck/components'
import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import { Fragment } from 'react'
import ModalContainer from './ModalContainer'

interface IProps {
  open: boolean
  setOpen: (input: boolean) => void
  onConfirm: () => void
  title: string
  loading: boolean
  success: boolean
  error: boolean
}

const ConfirmModal = ({
  open,
  setOpen,
  onConfirm,
  title,
  loading = false,
  success = false,
  error = false
}: IProps) => {
  return (
    <ModalContainer open={open} setOpen={setOpen} width={410} disableClose={loading || success}>
      <div className="px-5 py-4">
        <h2 className="font-medium">{success ? 'Integration successfully deleted' : title}</h2>
      </div>
      {success ? (
        <div className="px-5 py-8 text-gray-600 border-t">
          Redirecting to integrations overview..
        </div>
      ) : (
        <Fragment>
          <div
            className="px-5 py-8 text-gray-600 border-t border-b"
            style={{ fontSize: '0.9735rem' }}
          >
            {error && (
              <div className="flex items-center mb-5">
                <span className="mr-2 text-red-600">
                  <AlertCircleIcon color="currentColor" size={20} />
                </span>
                <span className="text-red-600" style={{ fontSize: '0.9375rem' }}>
                  Could not delete integration. Please try again.
                </span>
              </div>
            )}
            Are you sure you want to delete this integration? All configured settings will be lost.
          </div>
          <div className="flex items-center justify-end px-5 py-2">
            <div className="mr-4">
              <Button
                text="Cancel"
                isDisabled={loading}
                onClick={() => setOpen(false)}
                variant="outline"
              />
            </div>
            <div>
              <Button
                text="Delete"
                isLoading={loading}
                variant="danger"
                onClick={() => onConfirm()}
              />
            </div>
          </div>
        </Fragment>
      )}
    </ModalContainer>
  )
}

export default ConfirmModal
