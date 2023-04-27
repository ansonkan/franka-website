import 'the-new-css-reset/css/reset.css'
import '@/styles/globals.scss'
import { emberly, robotoFlex } from '@/fonts'
import type { AppProps } from 'next/app'
import Lenis from '@studio-freight/lenis'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import cn from 'clsx'
import { gsap } from 'gsap'
import { raf } from '@studio-freight/tempus'
import { useEffect } from 'react'
import { useFrame } from '@studio-freight/hamo'
import { useStore } from '@/lib/use-store'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
  ScrollTrigger.defaults({ markers: process.env.NODE_ENV === 'development' })

  // merge rafs
  gsap.ticker.lagSmoothing(0)
  gsap.ticker.remove(gsap.updateRoot)
  raf.add((time: number) => {
    gsap.updateRoot(time / 1000)
  }, 0)
}

export default function App({ Component, pageProps }: AppProps) {
  const [lenis, setLenis] = useStore((state) => [state.lenis, state.setLenis])

  useEffect(() => {
    window.scrollTo(0, 0)
    const lenis = new Lenis({ duration: 1.5 })
    setLenis(lenis)

    return () => {
      lenis.destroy()
      setLenis(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((time: number) => {
    lenis?.raf(time)
  })

  return (
    <div className={robotoFlex.className}>
      <header>
        <nav>
          <div className={cn(emberly.className, 'name')}>Franka Zwy</div>
        </nav>
      </header>

      <Component {...pageProps} />
    </div>
  )
}
