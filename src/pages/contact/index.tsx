import { GetStaticProps, NextPage } from 'next'
import { Document } from '@contentful/rich-text-types'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { gql } from '@/lib/contentful-gql'

interface ContactPageProps {
  document: Document
}

const ContactPage: NextPage<ContactPageProps> = ({ document }) => {
  return (
    <main className="rich-text-page">
      {documentToReactComponents(document)}
    </main>
  )
}

export default ContactPage

export const getStaticProps: GetStaticProps<ContactPageProps> = async () => {
  const { pageCollection } = await gql<{
    pageCollection: {
      items: { sys: { id: string }; content: { json: Document } }[]
    }
  }>(`{
    pageCollection(where: { slug: "contact" }) {
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
