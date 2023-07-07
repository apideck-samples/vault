import { SessionSettings, VaultAction } from 'types/JWTSession'

export const isActionAllowed = (settings?: SessionSettings) => (action: VaultAction): boolean => {
  if (!settings?.allowActions) {
    return true
  }

  return settings.allowActions.includes(action)
}
