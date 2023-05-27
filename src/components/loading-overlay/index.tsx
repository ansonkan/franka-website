import { useEffect, useState } from 'react'
import s from './loading-overlay.module.scss'
import { useGsap } from '@/lib/use-gsap'
import { useStore } from '@/lib/use-store'
import { useTranslation } from 'next-i18next'

export const LoadingOverlay = () => {
  const { t } = useTranslation()
  const { lenis, framerMotionReady, gsapReady, fontsReady } = useStore(
    (state) => state
  )
  const isReady = framerMotionReady && gsapReady && fontsReady
  const gsap = useGsap()

  const [isVisible, setIsVisible] = useState(!isReady)

  useEffect(() => {
    const onScroll = (event: Event) => {
      event.preventDefault()
      lenis?.scrollTo(0, { immediate: true })
    }

    if (!isVisible) {
      window.removeEventListener('scroll', onScroll)
      lenis?.start()
    } else {
      lenis?.stop()
      window.addEventListener('scroll', onScroll)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [isVisible, lenis])

  useEffect(() => {
    if (isReady) {
      setTimeout(() => {
        const ease = 'power2.inOut'
        const duration = 1
        const stagger = duration / 10

        gsap
          ?.timeline({
            onComplete: () => {
              setIsVisible(false)
            },
          })
          .to(`.${s.ldsEllipsis}`, { opacity: 0, duration, ease })
          .fromTo(
            [`.${s.name}`, `.${s.description}`],
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, stagger, ease }
          )
          .fromTo(
            `.${s.hint}`,
            { opacity: 0, y: 10 },
            { opacity: 0.7, y: 0, duration, ease },
            `-=${stagger}`
          )
          .to([`.${s.name}`, `.${s.description}`], {
            opacity: 0,
            y: -10,
            stagger,
            ease,
          })
          .to(
            `.${s.hint}`,
            { opacity: 0, y: -10, duration, ease },
            `-=${stagger}`
          )
          .fromTo(
            `.${s.loadingScreen}`,
            { '--progress': '100%' },
            { '--progress': '0%', ease }
          )
      }, 500)
    }
  }, [gsap, isReady])

  if (!isVisible) return <></>

  return (
    <div className={s.loadingScreen}>
      <div className={s.ldsEllipsis}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className={s.welcome}>
        <div className={s.name}>
          {t('plain-text.loading-overlay.welcome.name')}
        </div>
        <div className={s.description}>
          {t('plain-text.loading-overlay.welcome.description')}
        </div>
      </div>

      <div className={s.hint}>{t('plain-text.loading-overlay.hint')}</div>
    </div>
  )
}
