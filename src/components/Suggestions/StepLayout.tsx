import { useToast } from '@apideck/components'
import Link from 'next/link'
import { ReactNode } from 'react'

const StepLayout = ({
  stepIndex,
  nextPath,
  children
}: {
  stepIndex: number
  nextPath?: string
  children: ReactNode
}) => {
  const { addToast } = useToast()
  const secondStepPath = nextPath ? nextPath : ''
  const steps = [
    {
      id: 'Step 1',
      name: 'Enter your domain',
      href: stepIndex === 0 ? 'current' : '/suggestions',
      status: stepIndex === 0 ? 'current' : 'complete'
    },
    {
      id: 'Step 2',
      name: 'Select suggestions',
      href: secondStepPath || '',
      status: stepIndex === 1 ? 'current' : 'upcoming'
    },
    { id: 'Step 3', name: 'Manage settings', href: '/', status: 'upcoming' }
  ]

  const validateStep = () => {
    if (stepIndex === 0 && !nextPath) {
      addToast({
        title: 'Please enter a valid domain',
        description: '',
        type: 'warning',
        autoClose: true
      })
    }
  }
  return (
    <div className="w-full max-w-4xl mx-auto bg-white">
      <nav aria-label="Progress" className="mb-12 lg:mb-20">
        <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
          {steps.map((step) => (
            <li key={step.name} className="md:flex-1">
              {step.status === 'complete' ? (
                <Link href={step.href}>
                  <a className="flex flex-col py-2 pl-4 border-l-4 border-primary-600 group hover:border-primary-800 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4">
                    <span className="text-xs font-semibold tracking-wide uppercase text-primary-600 group-hover:text-primary-800">
                      {step.id}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </a>
                </Link>
              ) : step.status === 'current' ? (
                <Link href={step.href}>
                  <a
                    className="flex flex-col py-2 pl-4 border-l-4 border-primary-600 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                    aria-current="step"
                  >
                    <span className="text-xs font-semibold tracking-wide uppercase text-primary-600">
                      {step.id}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </a>
                </Link>
              ) : (
                <Link href={step.href}>
                  <a
                    className="flex flex-col py-2 pl-4 border-l-4 border-gray-200 group hover:border-gray-300 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4"
                    onClick={validateStep}
                  >
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase group-hover:text-gray-700">
                      {step.id}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </a>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {children}
    </div>
  )
}
export default StepLayout
