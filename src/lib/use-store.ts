import type Lenis from '@studio-freight/lenis'
import { create } from 'zustand'

export interface Store {
  lenis?: Lenis | null | undefined
  setLenis: (lenis: Lenis | null | undefined) => void
}

export const useStore = create<Store>((set) => ({
  lenis: undefined,
  setLenis: (lenis) => set({ lenis }),
}))
