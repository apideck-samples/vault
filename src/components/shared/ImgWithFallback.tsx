import { ImgHTMLAttributes, useEffect, useRef } from 'react'

const isImageValid = (src: string | undefined) => {
  const promise = new Promise((resolve) => {
    const img = document.createElement('img')
    img.onerror = () => resolve(false)
    img.onload = () => resolve(true)
    if (src) img.src = src
  })

  return promise
}

interface ImgWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string
}
const ImgWithFallback = ({ src, fallbackSrc, ...rest }: ImgWithFallbackProps) => {
  const imgEl: any = useRef(null)
  useEffect(() => {
    isImageValid(src).then((isValid) => {
      if (!isValid && imgEl?.current) {
        imgEl.current.src = fallbackSrc
      }
    })
  }, [fallbackSrc, src])

  return <img {...rest} ref={imgEl} src={src} />
}

export default ImgWithFallback
