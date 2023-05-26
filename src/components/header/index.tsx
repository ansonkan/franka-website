// import { useLayoutEffect, useRef } from 'react'
import { Fragment } from 'react'
import { LOCALES } from '@/constants'
import Link from 'next/link'
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
    <nav className={s.header}>
      <Link href="/" className={s.name}>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        <h1 className={s.invert} style={{ '--clip-path': 'url(#name-mask)' }}>
          <span className={s.base}>{t('plain-text.header.name')}</span>

          <svg className={s.svgMask}>
            <clipPath id="name-mask">
              <text y="16.5">
                {t('plain-text.header.name')
                  .split(' ')
                  .map((word, i) => (
                    <tspan key={word} x="0" y={`${(i + 1) * 1}rem`}>
                      {word}
                    </tspan>
                  ))}
              </text>
            </clipPath>
          </svg>
        </h1>
      </Link>

      <div className={s.links}>
        <Link href="/">{t('plain-text.header.selected-projects')}</Link>
        <Link href="/projects">{t('plain-text.header.all-projects')}</Link>
        <Link href="/contact">{t('plain-text.header.contact')}</Link>

        <div className={s.locales}>
          {LOCALES.map((l, i) => {
            return (
              <Fragment key={l}>
                {i > 0 && ' / '}

                {locale === l ? (
                  <p>{t(`plain-text.header.locales.${l}`)}</p>
                ) : (
                  <Link href={asPath} locale={l}>
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
