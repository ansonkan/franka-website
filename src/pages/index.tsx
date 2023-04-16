import { GetStaticProps, NextPage } from 'next'
import { Fragment } from 'react'
import Head from 'next/head'
import Image from 'next/image'
// import Link from 'next/link'
import cn from 'clsx'
// import gsap from 'gsap'
import { robotoFlex } from '@/fonts'
import s from './index.module.scss'

const colCount = 6
const portraitColSpan = 3
const landscapeColSpan = 4

const TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

interface Collection {
  title: string
  thumbnail: {
    width: number
    height: number
    url: string
    // for grid col span
    start: number
    span: number
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

      <div className="top">
        <Header className="title">Franka Zweydinger</Header>

        {[TEXT, TEXT].map((t, i) => (
          <p
            key={i}
            style={{
              gridColumn: `${i % 2 === 0 ? 1 : 4} / span 2`,
            }}
          >
            {t}
          </p>
        ))}
      </div>

      <div className="middle">
        {selectedWorks.map(({ title, thumbnail }, i) => {
          const { url, start, span, width, height } = thumbnail
          // const isPortrait = height > width

          return (
            <Fragment key={i}>
              <div
                key={i}
                className={s.thumbnail}
                style={{
                  gridColumn: `${start} / span ${span}`,
                  aspectRatio: width / height,
                }}
              >
                <Image
                  src={url}
                  fill
                  alt={title}
                  quality={15}
                  priority
                  // style={{
                  //   marginLeft: Math.random() > 0.5 ? 'auto' : 0,
                  // }}
                />
              </div>
              <div className="span-all" />
            </Fragment>
          )
        })}
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

  let lastStartCol = -1
  let lastEndCol = -1

  const getColSpan = (isPortrait: boolean) => {
    const span = isPortrait ? portraitColSpan : landscapeColSpan
    let start = -1
    let end = -1

    do {
      start = Math.round(Math.random() * (colCount - span)) + 1
      end = start + span - 1
    } while (start === lastStartCol || end === lastEndCol)
    // } while (start >= lastEndCol || end <= lastStartCol)

    lastStartCol = start
    lastEndCol = end

    return { start, end, span }
  }

  const selectedWorks = data.data.collectionCollection.items.map(
    ({ thumbnail, ...others }) => {
      return {
        thumbnail: {
          ...thumbnail,
          ...getColSpan(thumbnail.height > thumbnail.width),
        },
        ...others,
      }
    }
  )

  return {
    props: {
      selectedWorks,
    },
  }
}

interface HeaderProps {
  children?: string
  className?: string
}

function Header({ children, className }: HeaderProps) {
  const _cn = cn(robotoFlex.className, 'roboto-flex', className)

  if (!children) return <h1 className={_cn} />

  const words = children
    .trim()
    .split(' ')
    .filter((c) => !!c)

  return (
    <h1 className={_cn} style={{ display: 'flex', flexDirection: 'column' }}>
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            alignSelf: i === words.length - 1 ? 'flex-end' : 'flex-start',
          }}
        >
          {w}
        </span>
      ))}
    </h1>
  )
}
