import type Lenis from '@studio-freight/lenis'
import { create } from 'zustand'

enum LazyItems {
  fonts = 'fonts',
  gsap = 'gsap',
  'framer-motion' = 'framer-motion',
}

export interface Store {
  lenis?: Lenis | null | undefined
  setLenis: (lenis: Lenis | null | undefined) => void
  fontsReady: boolean
  gsapReady: boolean
  framerMotionReady: boolean
  setReady: (name: LazyItems | `${LazyItems}`) => void
  isLoadingOverlayVisible: boolean
  hideLoadingOverlay: () => void
}

export const useStore = create<Store>((set) => ({
  lenis: undefined,
  setLenis: (lenis) => set({ lenis }),
  fontsReady: false,
  gsapReady: false,
  framerMotionReady: false,
  setReady: (name) => {
    switch (name) {
      case LazyItems.fonts:
        set({ fontsReady: true })
        break
      case LazyItems['framer-motion']:
        set({ framerMotionReady: true })
        break
      case LazyItems.gsap:
        set({ gsapReady: true })
        break
    }
  },
  isLoadingOverlayVisible: true,
  hideLoadingOverlay: () => set({ isLoadingOverlayVisible: false }),
}))
