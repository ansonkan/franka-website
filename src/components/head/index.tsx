import { default as NextHead } from 'next/head'
import { i18n } from '~/next-i18next.config'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

export const Head = () => {
  const { t } = useTranslation('common')
  const router = useRouter()

  return (
    <NextHead>
      {/* TODO: dynamic title for all pages */}
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

      {i18n.locales
        .filter((locale) => locale !== (router.locale || i18n.defaultLocale))
        .map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={`${t('plain-text.head.origin')}/${locale}${
              router.asPath
            }`.replace(/\/$/, '')}
          />
        ))}

      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={t('plain-text.head.title') || ''} />
      <meta property="og:type" content="website" />
      <meta
        property="og:url"
        content={`${t('plain-text.head.origin')}${router.asPath}`}
      />
      <meta
        property="og:image"
        content={`${t('plain-text.head.origin')}/mstile-70x70.png`}
      />

      {/* TODO */}
      <meta name="twitter:title" content={t('plain-text.head.title') || ''} />
      <meta
        name="twitter:description"
        content={t('plain-text.head.description') || ''}
      />
      <meta
        name="twitter:image"
        content={`${t('plain-text.head.origin')}/mstile-70x70.png`}
      />
      <meta name="twitter:card" content="summary_large_image" />
    </NextHead>
  )
}
