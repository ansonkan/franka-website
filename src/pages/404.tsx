import { GetStaticProps, NextPage } from 'next'
import { m } from 'framer-motion'
import { mBlurProps } from '@/constants'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

const Custom404: NextPage = () => {
  const { t } = useTranslation('common')

  return (
    <main className="error-page">
      <m.div className="base" {...mBlurProps}>
        <h1 className="error">{t('plain-text.404.error')}</h1>
        <p className="description">{t('plain-text.404.description')}</p>
      </m.div>
    </main>
  )
}

Custom404.displayName = '404 page'

export default Custom404

export const getStaticProps: GetStaticProps = async ({ locale = 'en-US' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
