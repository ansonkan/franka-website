import { ContentfulRichText, Links } from '@/components/contentful-rich-text'
import { GetStaticProps, NextPage } from 'next'
import { Document } from '@contentful/rich-text-types'
import { PageImprintDocument } from '@/gql/graphql'
import { client } from '@/lib/contentful-gql'

interface ImprintProps {
  document: Document
  links?: Links
}

const Imprint: NextPage<ImprintProps> = ({ document, links }) => {
  return (
    <main className="rich-text-page">
      <ContentfulRichText links={links}>{document}</ContentfulRichText>
    </main>
  )
}

export default Imprint

export const getStaticProps: GetStaticProps<ImprintProps> = async () => {
  const data = await client.request(PageImprintDocument)

  if (!data.pageCollection?.items[0]?.content) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      document: data.pageCollection.items[0].content.json,
      links: data.pageCollection.items[0].content.links as Links,
    },
  }
}
