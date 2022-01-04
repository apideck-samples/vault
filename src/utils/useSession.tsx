import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react'

import { JWTSession } from 'types/JWTSession'

interface ContextProps {
  createSession: () => Promise<void>
  setSession: Dispatch<SetStateAction<JWTSession | null>>
  session: JWTSession | null
  isLoading: boolean
}

const SessionContext = createContext<Partial<ContextProps>>({})

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<JWTSession | null>(null)

  return (
    <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>
  )
}

export const useSession = () => {
  return useContext(SessionContext) as ContextProps
}
