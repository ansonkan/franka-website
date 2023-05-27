import { useEffect } from 'react'
import { useStore } from './use-store'

type onEnter = () => void

// Note: check out useExit for the history of this hook
export const useEnter = (onEnter: onEnter) => {
  const [lenis] = useStore(({ lenis }) => [lenis])

  useEffect(() => {
    // lenis?.scrollTo(0, { immediate: true })
    lenis?.start()
    onEnter()
  }, [lenis, onEnter])
}
