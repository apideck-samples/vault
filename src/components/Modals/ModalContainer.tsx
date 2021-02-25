import { createRef, useEffect } from 'react'

import { Portal } from 'components'
import { Transition } from 'react-transition-group'

const TIMEOUT = 300
const getModalTransitionStyles: { [key: string]: { [key: string]: string | number } } = {
  entering: {
    opacity: 0,
    transform: 'translateY(-20px) scale(.95)'
  },
  entered: {
    transition: `opacity ${TIMEOUT}ms ease-in-out, transform ${TIMEOUT}ms ease-in-out`,
    opacity: 1,
    transform: 'translateY(0) scale(1)'
  },
  exiting: {
    transition: `opacity ${TIMEOUT}ms ease-in-out, transform ${TIMEOUT}ms ease-in-out`,
    opacity: 0,
    transform: 'translateY(-20px) scale(.95)'
  }
}
const getBackdropTransitionStyles: { [key: string]: { [key: string]: string | number } } = {
  entering: {
    opacity: 0
  },
  entered: {
    transition: `opacity ${TIMEOUT}ms ease-in-out`,
    opacity: 1
  },
  exiting: {
    transition: `opacity ${TIMEOUT}ms ease-in-out`,
    opacity: 0
  }
}

interface IProps {
  open: boolean
  setOpen: (input: boolean) => void
  width?: number
  disableClose?: boolean
}

const ModalContainer: React.FC<IProps> = ({
  open,
  setOpen,
  width = 700,
  disableClose = false,
  children
}) => {
  const ref = createRef<HTMLDivElement>()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!disableClose && e.keyCode === 27) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [setOpen, disableClose])

  useEffect(() => {
    if (open) {
      ref?.current?.focus()
    }
  }, [ref, open])

  return (
    <Portal elementById="modal">
      <Transition
        in={open}
        timeout={{
          enter: TIMEOUT,
          exit: TIMEOUT
        }}
        unmountOnExit
        appear
      >
        {(status: 'entering' | 'entered' | 'exiting') => (
          <div
            className="fixed top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center w-full h-full bg-gray-400 bg-opacity-75"
            style={{ ...getBackdropTransitionStyles[status] }}
            onClick={() => !disableClose && setOpen(false)}
            data-testid={'modal-container'}
          >
            <div
              ref={ref}
              tabIndex={0}
              className="bg-white rounded shadow outline-none"
              style={{
                width: `${width}px`,
                ...getModalTransitionStyles[status]
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </div>
        )}
      </Transition>
    </Portal>
  )
}

export default ModalContainer
