import { GetStaticProps, NextPage } from 'next'
import { m } from 'framer-motion'
import { mBlurProps } from '@/constants'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

const Custom500: NextPage = () => {
  const { t } = useTranslation('common')

  return (
    <main className="error-page">
      <m.div className="base" {...mBlurProps}>
        <h1 className="error">{t('plain-text.500.error')}</h1>
        <p className="description">{t('plain-text.500.description')}</p>
      </m.div>
    </main>
  )
}

Custom500.displayName = '500 page'

export default Custom500

export const getStaticProps: GetStaticProps = async ({ locale = 'en-US' }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
