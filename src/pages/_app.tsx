import 'the-new-css-reset/css/reset.css'
import '@/styles/globals.scss'
import type { AppProps } from 'next/app'
import Lenis from '@studio-freight/lenis'
import Link from 'next/link'
import { RealViewport } from '@/components/real-viewport'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { raf } from '@studio-freight/tempus'
import { robotoFlex } from '@/fonts'
import { useDebug } from '@studio-freight/hamo'
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

const Stats = dynamic(
  () => import('@/components/stats').then(({ Stats }) => Stats),
  { ssr: false }
)

export default function App({ Component, pageProps }: AppProps) {
  const debug = useDebug()

  const [lenis, setLenis] = useStore((state) => [state.lenis, state.setLenis])

  useEffect(() => {
    window.scrollTo(0, 0)
    const lenis = new Lenis({
      smoothTouch: true,
    })
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
    <>
      <div className={robotoFlex.className}>
        {debug && <Stats />}

        <nav className="header">
          <h1 className="name">Franka Robin Zweydinger</h1>

          <div className="links">
            <Link href="/portfolio">Portfolio</Link>
            <Link href="/advertising">Advertising</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/social-media">Social Media</Link>
          </div>
        </nav>

        <Component {...pageProps} />
      </div>

      <RealViewport />
    </>
  )
}
