import { ContentfulRichText, Links } from '@/components/contentful-rich-text'
import { GetStaticProps, NextPage } from 'next'
import { Document } from '@contentful/rich-text-types'
import { PagePortfolioDocument } from '@/gql/graphql'
import { client } from '@/lib/contentful-gql'

interface PortfolioProps {
  document: Document
  links?: Links
}

const Portfolio: NextPage<PortfolioProps> = ({ document, links }) => {
  return (
    <main className="rich-text-page">
      <ContentfulRichText links={links}>{document}</ContentfulRichText>
    </main>
  )
}

export default Portfolio

export const getStaticProps: GetStaticProps<PortfolioProps> = async () => {
  const data = await client.request(PagePortfolioDocument)

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
