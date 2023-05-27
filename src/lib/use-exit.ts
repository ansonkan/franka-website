import { useEffect } from 'react'
import { usePresence } from 'framer-motion'
import { useStore } from './use-store'

type onExit = (safeToRemove: () => void) => void

// Note:
// This works fine as far as I know, but it stopped working when I started using useEnter.
// Tried both useEffect and useLayoutEffect in useEnter but it didn't help, and `m` from framer-motion
// works perfectly fine once I figured the page css issue. Since I think simple animation is good enough
// for now, and I don't know what else to animation, so I will just keep using `m` for now.
//
// Leave this here just for reference
export const useExit = (onExit: onExit) => {
  const [lenis] = useStore(({ lenis }) => [lenis])
  const [isPresent, safeToRemove] = usePresence()

  useEffect(() => {
    if (!isPresent) {
      lenis?.stop()

      onExit(() => {
        safeToRemove()
        lenis?.start()
      })
    }
  }, [isPresent, lenis, onExit, safeToRemove])
}
