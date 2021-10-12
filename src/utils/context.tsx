import { createContext } from 'react'

export const ThemeContext = createContext({})
export const SessionExpiredModalContext = createContext({
  sessionExpired: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSessionExpired: (_expired: boolean) => {}
})
