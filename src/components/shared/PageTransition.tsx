import { Transition, TransitionGroup } from 'react-transition-group'

const TIMEOUT = 300
const getTransitionStyles: { [key: string]: { [key: string]: string | number } } = {
  entering: {
    position: 'absolute',
    opacity: 0,
    transform: 'translateX(50px)'
  },
  entered: {
    transition: `opacity ${TIMEOUT}ms ease-in-out, transform ${TIMEOUT}ms ease-in-out`,
    opacity: 1,
    transform: 'translateX(0px)'
  },
  exiting: {
    transition: `opacity ${TIMEOUT}ms ease-in-out, transform ${TIMEOUT}ms ease-in-out`,
    opacity: 0,
    transform: 'translateX(-50px)'
  }
}

const PageTransition: React.FC<{ location: string }> = ({ location, children }) => {
  return (
    <TransitionGroup component={null}>
      <Transition
        key={location}
        timeout={{
          enter: TIMEOUT,
          exit: TIMEOUT
        }}
      >
        {(status) => (
          <div className="flex flex-col flex-1 w-full" style={{ ...getTransitionStyles[status] }}>
            {children}
          </div>
        )}
      </Transition>
    </TransitionGroup>
  )
}
export default PageTransition
