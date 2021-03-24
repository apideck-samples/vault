import React from 'react'
import { FaExclamationTriangle } from 'react-icons/fa'

interface IProps {
  title: string
  description: string
}

export const Alert: React.FC<IProps> = ({ title, description, children }) => {
  return (
    <div
      className="bg-red-50 border border-red-500 text-m text-red-500 px-5 py-4 mb-6 rounded-md"
      role="alert"
    >
      <h3 className="text-m font-medium flex items-center mb-2">
        <span className="mr-2">
          <FaExclamationTriangle />
        </span>{' '}
        {title}
      </h3>
      <p className="text-sm">{description}</p>
      {children}
    </div>
  )
}
