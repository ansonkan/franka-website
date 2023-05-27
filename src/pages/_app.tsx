import 'the-new-css-reset/css/reset.css'
import '@/styles/globals.scss'
import { NextComponentType, NextPageContext } from 'next'
import { appWithTranslation, useTranslation } from 'next-i18next'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { AppProps } from 'next/app'
import { ContentfulRichText } from '@/components/contentful-rich-text'
import Head from 'next/head'
import { Header } from '@/components/header'
import Lenis from '@studio-freight/lenis'
import { RealViewport } from '@/components/real-viewport'
import cn from 'clsx'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { raf } from '@studio-freight/tempus'
import { roboto } from '@/fonts'
import { useDebug } from '@studio-freight/hamo'
import { useFrame } from '@studio-freight/hamo'
import { useRouter } from 'next/router'
import { useStore } from '@/lib/use-store'

// if (typeof window !== 'undefined') {
//   gsap.registerPlugin(ScrollTrigger)
//   ScrollTrigger.defaults({ markers: process.env.NODE_ENV === 'development' })

//   // merge rafs
//   gsap.ticker.lagSmoothing(0)
//   gsap.ticker.remove(gsap.updateRoot)
//   raf.add((time: number) => {
//     gsap.updateRoot(time / 1000)
//   }, 0)
// }

const Stats = dynamic(
  () => import('@/components/stats').then(({ Stats }) => Stats),
  { ssr: false }
)

function App({ Component, pageProps }: AppProps) {
  const debug = useDebug()
  const router = useRouter()
  const { t } = useTranslation('common')
  const [lenis, setLenis] = useStore((state) => [state.lenis, state.setLenis])

  const [isTransitioning, setIsTransitioning] = useState(false)
  const prevPage =
    useRef<NextComponentType<NextPageContext, any, any>>(Component)
  const prevPageProps = useRef<any>(pageProps)

  useLayoutEffect(() => {
    // gsap.registerPlugin(ScrollTrigger)
    // ScrollTrigger.defaults({ markers: process.env.NODE_ENV === 'development' })

    // merge rafs
    gsap.ticker.lagSmoothing(0)
    gsap.ticker.remove(gsap.updateRoot)
    raf.add((time: number) => {
      gsap.updateRoot(time / 1000)
    }, 0)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    const lenis = new Lenis({
      syncTouch: true,
    })
    setLenis(lenis)

    return () => {
      lenis.destroy()
      setLenis(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useEffect(() => {
  //   isLoading ? lenis?.stop() : lenis?.start()
  // }, [isLoading, lenis])

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
  }, [])

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
  }, [lenis, router.asPath])

  useFrame((time: number) => {
    lenis?.raf(time)
  })

  useEffect(() => {
    const onRouteChangeStart = () => {
      setIsTransitioning(true)
    }

    const onRouteChangeComplete = () => {
      console.log('START counting 1s...')
      setTimeout(() => {
        prevPage.current = Component
        prevPageProps.current = pageProps
        console.log('DONE counting 1s!!!')
        setIsTransitioning(false)
      }, 1000)
    }

    const onRouteChangeError = () => {
      setIsTransitioning(false)
    }

    router.events.on('routeChangeStart', onRouteChangeStart)
    router.events.on('routeChangeComplete', onRouteChangeComplete)
    router.events.on('routeChangeError', onRouteChangeError)

    return () => {
      router.events.off('routeChangeStart', onRouteChangeStart)
      router.events.off('routeChangeComplete', onRouteChangeComplete)
      router.events.off('routeChangeError', onRouteChangeError)
    }
  }, [Component, pageProps, router.events])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const footerContent: any = t('rich-text.footer', { returnObjects: true })

  const Page = !isTransitioning ? Component : prevPage.current
  // const Page = !isTransitioning ? prevPage.current : prevPage.current
  const currentPageProps = !isTransitioning ? pageProps : prevPageProps.current

  console.log(Page.displayName, currentPageProps, isTransitioning)

  return (
    <>
      <Head>
        <title>{t('plain-text.head.title')}</title>
        <meta
          name="description"
          content={t('plain-text.head.description') || ''}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <div className={cn('root', roboto.className)}>
        {debug && <Stats />}

        <Header />

        {/* <Component {...pageProps} /> */}
        <Page {...currentPageProps} />

        <footer className="mix-blend-invert">
          {footerContent && (
            <ContentfulRichText links={footerContent.links}>
              {footerContent.json}
            </ContentfulRichText>
          )}
        </footer>

        {/* {isLoading && <div className="loading-screen" />} */}
      </div>

      <RealViewport />
    </>
  )
}

export default appWithTranslation(App)
