import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
// import Image from 'next/image'
// import Link from 'next/link'
// import cn from 'clsx'
// import gsap from 'gsap'
// import { robotoFlex } from '@/fonts'
// import s from './index.module.scss'
import { gql } from '@/lib/contentful-gql'

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
    <main>
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
  const { collectionCollection } = await gql<{
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
  }>(`{
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
  }`)

  return {
    props: {
      selectedWorks: collectionCollection.items,
    },
  }
}
