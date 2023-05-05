import { GetStaticProps, NextPage } from 'next'
import { Document } from '@contentful/rich-text-types'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { gql } from '@/lib/contentful-gql'

interface AdvertisingPageProps {
  document: Document
}

const AdvertisingPage: NextPage<AdvertisingPageProps> = ({ document }) => {
  return (
    <main className="rich-text-page">
      {documentToReactComponents(document)}
    </main>
  )
}

export default AdvertisingPage

export const getStaticProps: GetStaticProps<
  AdvertisingPageProps
> = async () => {
  const { pageCollection } = await gql<{
    pageCollection: {
      items: { sys: { id: string }; content: { json: Document } }[]
    }
  }>(`{
    pageCollection(where: { slug: "advertising" }) {
      items {
        sys {
          id
        }
        content {
          json
        }
      }
    }
  }`)

  return {
    props: {
      document: pageCollection.items[0].content.json,
    },
  }
}
