import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import {
  RichTextPageDocument,
  RichTextPageQuery,
  RichTextPagesDocument,
} from '@/gql/graphql'
import { ContentfulRichText } from '@/components/contentful-rich-text'
import { client } from '@/lib/contentful-gql'
import { fillColorMap } from '@/lib/get-img-color'
import { i18n } from '~/next-i18next.config'
import { m } from 'framer-motion'
import { mBlurProps } from '@/constants'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

interface RichTextPageProps {
  content: NonNullable<
    NonNullable<
      NonNullable<RichTextPageQuery['richTextPagesCollection']>['items'][number]
    >['content']
  >
  colorMap: Record<string, string>
}

const RichTextPage: NextPage<RichTextPageProps> = ({ content, colorMap }) => {
  return (
    <m.main className="normalPageRoot" {...mBlurProps}>
      <ContentfulRichText
        // Note: I already used the same generated type for `links`... idk why still the type is broken. Don't care for now
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        links={content.links as any}
        colorMap={colorMap}
      >
        {content.json}
      </ContentfulRichText>
    </m.main>
  )
}

RichTextPage.displayName = 'Rich text page'

export default RichTextPage

type Params = {
  slug: string
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const data = await client.request(RichTextPagesDocument)

  return {
    paths: (
      data.richTextPagesCollection?.items
        .filter((item) => !!item?.slug)
        .map((item) => ({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          params: { slug: item!.slug as string },
        })) || []
    ).reduce((acc, cur) => {
      i18n.locales.forEach((l) => {
        acc = [...acc, { ...cur, locale: l }]
      })

      return acc
    }, [] as any),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<RichTextPageProps> = async ({
  params,
  locale = 'en-US',
}) => {
  if (typeof params?.slug !== 'string') {
    return {
      notFound: true,
    }
  }

  const data = await client.request(RichTextPageDocument, {
    slug: params.slug,
    locale,
  })

  if (!data.richTextPagesCollection?.items[0]?.content) {
    return {
      notFound: true,
    }
  }

  const content = data.richTextPagesCollection.items[0].content
  const colorMap: Record<string, string> = {}

  await fillColorMap(
    content.links.assets.block.map((item) => ({
      url: item?.url,
    })),
    colorMap
  )

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      content,
      colorMap,
    },
  }
}
