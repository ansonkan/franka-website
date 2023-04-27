import { GetStaticProps, NextPage } from 'next'
import { Fragment } from 'react'
import Head from 'next/head'
import Image from 'next/image'
// import Link from 'next/link'
import cn from 'clsx'
// import gsap from 'gsap'
import { robotoFlex } from '@/fonts'
import s from './index.module.scss'

const TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

interface Collection {
  title: string
  thumbnail: {
    width: number
    height: number
    url: string
  }
}

interface IndexProps {
  selectedWorks: Collection[]
}

const Index: NextPage<IndexProps> = ({ selectedWorks }) => {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '2vw' }}>
      <Head>
        <title>Franka</title>
        <meta name="description" content="Franka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </main>
  )
}

export default Index

export const getStaticProps: GetStaticProps<IndexProps> = async () => {
  const res = await fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST', // GraphQL *always* uses POST requests!
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`, // add our access token header
      },
      // send the query we wrote in GraphiQL as a string
      body: JSON.stringify({
        // all requests start with "query: ", so we'll stringify that for convenience
        query: `
        {
          collectionCollection {
            items {
              sys {
                id
              }
              title
              thumbnail {
                width
                height
                url
              }
            }
          }
        }
      `,
      }),
    }
  )

  const data: {
    data: {
      collectionCollection: {
        items: Array<{
          sys: { id: string }
          title: string
          thumbnail: {
            width: number
            height: number
            url: string
          }
        }>
      }
    }
  } = await res.json()

  return {
    props: {
      selectedWorks: data.data.collectionCollection.items,
    },
  }
}
