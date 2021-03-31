import { createContext } from 'react'

export interface ThemeContextType {
  vault_name: string
  favicon: string
  primary_color: string
  terms_url: string
  privacy_url: string
  logo: string
  sidepanel_background_color: string
  sidepanel_text_color: string
}

export const ThemeContext = createContext({})
export const SessionExpiredModalContext = createContext({
  sessionExpired: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSessionExpired: (_expired: boolean) => {}
})
