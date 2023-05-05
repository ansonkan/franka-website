import { ContentfulRichText, Links } from '@/components/contentful-rich-text'
import { GetStaticProps, NextPage } from 'next'
import { Document } from '@contentful/rich-text-types'
import { gql } from '@/lib/contentful-gql'

interface AdvertisingProps {
  document: Document
  links: Links
}

const Advertising: NextPage<AdvertisingProps> = ({ document, links }) => {
  return (
    <main className="rich-text-page">
      <ContentfulRichText links={links}>{document}</ContentfulRichText>
    </main>
  )
}

export default Advertising

export const getStaticProps: GetStaticProps<AdvertisingProps> = async () => {
  const { pageCollection } = await gql<{
    pageCollection: {
      items: {
        sys: { id: string }
        content: { json: Document; links: Links }
      }[]
    }
  }>(`{
    pageCollection(where: { slug: "advertising" }, limit: 1) {
      items {
        sys {
          id
        }
        content {
          json
          links {
            assets {
              hyperlink {
                sys {
                  id
                }
                title
                description
                contentType
                fileName
                size
                url
                width
                height
              }
              block {
                sys {
                  id
                }
                title
                description
                contentType
                fileName
                size
                url
                width
                height
              }
            }
          }
        }
      }
    }
  }`)

  return {
    props: {
      document: pageCollection.items[0].content.json,
      links: pageCollection.items[0].content.links,
    },
  }
}
