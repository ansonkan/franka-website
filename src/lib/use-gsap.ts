import { useEffect, useState } from 'react'
import { useStore } from './use-store'

let gsap: GSAP | undefined

export const useGsap = () => {
  const [gsapState, setGsapState] = useState(gsap)
  const [setReady] = useStore((state) => [state.setReady])

  useEffect(() => {
    const loadGsap = async () => {
      const gsapLib = (await import('gsap')).default
      gsap = gsapLib
      setGsapState(gsap)
      setReady('gsap')
    }

    if (!gsapState) {
      loadGsap()
    }
  }, [gsapState, setReady])

  return gsapState
}
