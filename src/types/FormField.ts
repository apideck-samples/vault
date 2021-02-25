import { ReactText } from 'react'

export interface FormField {
  id: string
  label: string
  value: string | string[] | number | boolean | undefined
  placeholder: string
  mask: boolean
  type: string
  required: boolean
  description?: string
  disabled: boolean
  options?: { value: ReactText; label: string }[] | null
}
