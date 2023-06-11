import { clamp, lerp } from '@/lib/maths'
import { useCallback, useEffect, useRef, useState } from 'react'
import cn from 'clsx'
import s from './loading-overlay.module.scss'
import { useFrame } from '@studio-freight/hamo'
import { useGsap } from '@/lib/use-gsap'
import { useStore } from '@/lib/use-store'

export const LoadingOverlay = () => {
  const {
    lenis,
    framerMotionReady,
    gsapReady,
    fontsReady,
    hideLoadingOverlay,
  } = useStore(
    ({
      lenis,
      framerMotionReady,
      gsapReady,
      fontsReady,
      hideLoadingOverlay,
    }) => ({
      lenis,
      framerMotionReady,
      gsapReady,
      fontsReady,
      hideLoadingOverlay,
    })
  )
  const isReady = framerMotionReady && gsapReady && fontsReady

  const [isVisible, setIsVisible] = useState(!isReady)
  const progressOverlayRef = useRef<HTMLDivElement | null>(null)
  const isClosing = useRef(false)

  const gsap = useGsap()
  const progress = useRef(0)
  // const aniProgress = useRef(0)
  const [aniProgress, setAniProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (progress.current < 90) progress.current++
    }, 50)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (gsapReady) {
      progress.current = clamp(0, 100, progress.current + 34)
    }
  }, [gsapReady])

  useEffect(() => {
    if (framerMotionReady) {
      progress.current = clamp(0, 100, progress.current + 34)
    }
  }, [framerMotionReady])

  useEffect(() => {
    if (fontsReady) {
      progress.current = clamp(0, 100, progress.current + 34)
    }
  }, [fontsReady])

  useEffect(() => {
    if (isReady && progress.current < 100) {
      progress.current = 100
    }
  }, [isReady])

  const close = useCallback(() => {
    if (!gsap || isClosing.current) return

    isClosing.current = true

    gsap.to(`.${s.loadingScreen}`, {
      '--curtain': '0%',
      ease: 'power2.inOut',
      duration: 1,
      onStart: () => {
        lenis?.scrollTo(0, { force: true, lock: true })
      },
      onComplete: () => {
        setIsVisible(false)
        hideLoadingOverlay()
      },
    })
  }, [gsap, hideLoadingOverlay, lenis])

  useFrame(() => {
    if (progress.current >= 100 && aniProgress >= 99.9) {
      close()
    }

    setAniProgress(clamp(0, 100, lerp(aniProgress, progress.current, 0.1)))

    progressOverlayRef.current?.style.setProperty(
      '--progress',
      `${aniProgress}%`
    )
  })

  if (!isVisible) return <></>

  return (
    <div className={s.loadingScreen}>
      <div className={s.progressOverlay} ref={progressOverlayRef} />

      <div className={cn(s.counter, 'mix-blend-invert')}>
        <div className={s.base}>{`${aniProgress
          .toFixed(0)
          .padStart(3, '0')}%`}</div>
      </div>
    </div>
  )
}
