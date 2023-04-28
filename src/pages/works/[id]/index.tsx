import { GetServerSideProps, NextPage } from 'next'
import { useMemo, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'clsx'
import { emberly } from '@/fonts'
import gsap from 'gsap'
import s from './index.module.scss'
import { useMediaQuery } from '@studio-freight/hamo'

const TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

interface Work {
  sys: { id: string }
  title: string
  thumbnail: {
    width: number
    height: number
    url: string
  }
}

interface IndexProps {
  selectedWorks?: Work[]
}

const Index: NextPage<IndexProps> = () => {
  const isMd = useMediaQuery('(min-width: 800px)')
  const isLg = useMediaQuery('(min-width: 1200px)')

  const [title, setTitle] = useState('')

  const breakpoint = useMemo(() => {
    if (isLg) return 'lg'
    if (isMd) return 'md'
    return 'base'
  }, [isLg, isMd])

  return (
    <main className={s.root}>
      <Head>
        <title>Franka</title>
        <meta name="description" content="Franka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={s.gallery}></div>

      <div className={cn(s.info, emberly.className)}>
        <h1 className={cn(s.header)}>Franka</h1>

        <div className={cn(s.titleWrapper)}>
          <h2 className={cn(s.title)}>{title}</h2>
        </div>

        <nav className={cn(s.nav)}>
          <Link href="/">About</Link>
          <Link href="/">Contact</Link>
        </nav>
      </div>
    </main>
  )
}

export default Index

export const getServerSideProps: GetServerSideProps<IndexProps> = async () => {
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
          collection(id: "7IjoA5GwmM4kVc78glQoKJ") {
            photosCollection {
              items {
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
        items: Work[]
      }
    }
  } = await res.json()

  return {
    props: {},
  }
}
