import { useEffect, useRef, useState } from 'react'

import { createPortal } from 'react-dom'

const Portal: React.FC<{ elementById: string }> = ({ elementById, children }) => {
  const ref = useRef<HTMLElement | null>()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    ref.current = document.getElementById(elementById)
    setMounted(true)
  }, [elementById])

  return mounted ? createPortal(children, ref.current as HTMLElement) : null
}

export default Portal
