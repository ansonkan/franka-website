import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
// import Link from 'next/link'
import { useLayoutEffect, useRef } from 'react'
import cn from 'clsx'
import { emberly } from '@/fonts'
import gsap from 'gsap'
import s from './index.module.scss'

const TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

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
  const rootRef = useRef<HTMLElement>(null)
  const hasSetup = useRef(false)

  useLayoutEffect(() => {
    if (hasSetup.current) return

    // const tls: gsap.core.Timeline[] = []

    const items = gsap.utils.toArray<HTMLImageElement>(`.${s.item}`)

    items.forEach((item) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: item } })
      // tls.push(tl)
      tl.from(item.querySelector('img'), {
        x: '100%',
        y: '100%',
        ease: 'expo',
        rotation: -45,
        scrollTrigger: {
          trigger: item,
        },
      })
      tl.from(item.querySelector(`.${s.title}`), { opacity: 0 })
    })

    hasSetup.current = true

    // return () => {
    //   console.log('clean up layout effect')
    //   // tls.forEach((tl) => tl.revert())
    // }
  }, [])

  return (
    <main ref={rootRef}>
      <Head>
        <title>Franka</title>
        <meta name="description" content="Franka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={s.root}>
        <div className={s.right}>
          <div className={s.info}>
            <h1 className={cn(s.header, emberly.className)}>Franka Zwy</h1>

            <p className={s.description}>{TEXT}</p>
          </div>
        </div>

        <div className={s.works}>
          {selectedWorks.map(({ title, thumbnail }, i) => (
            <div key={i} className={s.item}>
              <div
                className={s.thumbnail}
                style={{ aspectRatio: thumbnail.width / thumbnail.height }}
              >
                <Image
                  src={thumbnail.url}
                  fill
                  alt={title}
                  sizes="50vw"
                  priority
                />
              </div>

              <h2
                className={s.title}
                style={{
                  maxWidth: `calc(50vw * ${
                    thumbnail.height / thumbnail.width
                  })`,
                }}
              >
                {title}
              </h2>
            </div>
          ))}
        </div>
      </div>
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
      selectedWorks: [
        ...data.data.collectionCollection.items,
        ...data.data.collectionCollection.items,
        ...data.data.collectionCollection.items,
        ...data.data.collectionCollection.items,
        ...data.data.collectionCollection.items,
        ...data.data.collectionCollection.items,
        ...data.data.collectionCollection.items,
      ],
    },
  }
}
