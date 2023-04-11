import { useEffect } from 'react'
import { useStore } from '@/lib/use-store'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useScroll(callback: (args: any) => void, deps: any[] = []) {
  const lenis = useStore(({ lenis }) => lenis)

  useEffect(() => {
    if (!lenis) return
    lenis.on('scroll', callback)
    lenis.emit()

    return () => {
      lenis.off('scroll', callback)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis, callback, [...deps]])
}
