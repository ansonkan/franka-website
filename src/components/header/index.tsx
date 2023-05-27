import { Fragment } from 'react'
import { LOCALES } from '@/constants'
import Link from 'next/link'
import cn from 'clsx'
import s from './header.module.scss'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

export const Header = () => {
  const { t } = useTranslation('common')
  const { asPath, locale } = useRouter()

  // Note: I don't want that jank... so commenting out this setup
  // const ref = useRef<HTMLElement>(null)

  // useLayoutEffect(() => {
  //   const onResize = () => {
  //     document.documentElement.style.setProperty(
  //       '--normal-page-top-offset',
  //       `${ref.current?.getBoundingClientRect().height || '0'}px`
  //     )
  //   }

  //   onResize()
  //   window.addEventListener('resize', onResize)

  //   return () => {
  //     window.removeEventListener('resize', onResize)
  //   }
  // }, [])

  return (
    <nav className={cn(s.header, 'mix-blend-invert')}>
      <Link href="/" className={s.name} scroll={false}>
        <h1>{t('plain-text.header.name')}</h1>
      </Link>

      <div className={s.links}>
        <Link href="/" scroll={false}>
          {t('plain-text.header.selected-projects')}
        </Link>

        <Link href="/projects" scroll={false}>
          {t('plain-text.header.all-projects')}
        </Link>

        <Link href="/contact" scroll={false}>
          {t('plain-text.header.contact')}
        </Link>

        <div className={s.locales}>
          {LOCALES.map((l, i) => {
            return (
              <Fragment key={l}>
                {i > 0 && ' / '}

                {locale === l ? (
                  <p>{t(`plain-text.header.locales.${l}`)}</p>
                ) : (
                  <Link href={asPath} locale={l} scroll={false}>
                    {t(`plain-text.header.locales.${l}`)}
                  </Link>
                )}
              </Fragment>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
