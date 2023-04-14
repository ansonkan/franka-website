/* eslint-disable @next/next/no-img-element */
import { GetStaticProps, NextPage } from 'next'
import { useCallback, useEffect, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'clsx'
import gsap from 'gsap'
import { mapRange } from '@/lib/maths'
import { robotoFlex } from '@/fonts'
import s from './index.module.scss'
import { useRect } from '@studio-freight/hamo'
import { useScroll } from '@/lib/use-scroll'
import { useWindowSize } from 'react-use'

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
  const activeIndex = useRef<number | null>(null)
  const listRef = useRef<HTMLElement | null>(null)
  const [listRectRef, listRect] = useRect()

  const previewRef = useRef<HTMLUListElement | null>(null)
  const [previewRectRef, previewRect] = useRect()

  const initialized = useRef(false)

  const { height: windowHeight } = useWindowSize()

  const itemHeight = listRect.height / selectedWorks.length
  const total = listRect.height - itemHeight
  const scrollHeight = windowHeight + total

  const previewActiveItemHeight = windowHeight / 1.8
  const previewNormalItemHeight = windowHeight / 6
  const previewHeight =
    previewActiveItemHeight +
    (selectedWorks.length - 1) * (windowHeight * 0.01 + previewNormalItemHeight)
  const quickToMap = useRef<Map<gsap.TweenTarget, gsap.QuickToFunc>>(new Map())
  const getThumbnailQuickTo = useCallback((target: gsap.TweenTarget) => {
    if (!quickToMap.current.has(target)) {
      quickToMap.current.set(target, gsap.quickTo(target, 'height', {}))
    }

    return quickToMap.current.get(target)!
  }, [])

  useEffect(() => {
    if (!previewRef.current || initialized.current) return

    gsap.set(previewRef.current.children.item(selectedWorks.length - 1), {
      height: windowHeight / 1.8,
    })

    initialized.current = true
  }, [selectedWorks.length, windowHeight])

  useScroll(({ scroll }) => {
    if (
      !initialized.current ||
      !listRect ||
      !listRef.current ||
      !previewRect ||
      !previewRef.current
    ) {
      return
    }

    listRef.current.style.transform = `translateY(${
      (windowHeight - itemHeight) / 2 - scroll
    }px)`

    const activePreviewItemHeight = windowHeight / 1.8

    previewRef.current.style.transform = `translateY(${
      previewHeight * -1 +
      windowHeight / 2 +
      activePreviewItemHeight / 2 +
      mapRange(0, total, scroll, 0, previewHeight - activePreviewItemHeight)
    }px)`

    const newActiveIndex = Math.round(scroll / itemHeight)

    if (isNaN(newActiveIndex)) return

    if (newActiveIndex !== activeIndex.current) {
      activateTitle(listRef.current.children.item(newActiveIndex), 'on')

      getThumbnailQuickTo(
        previewRef.current.children.item(
          selectedWorks.length - newActiveIndex - 1
        )
      )(previewActiveItemHeight)

      if (typeof activeIndex.current === 'number') {
        activateTitle(listRef.current.children.item(activeIndex.current), 'off')

        getThumbnailQuickTo(
          previewRef.current.children.item(
            selectedWorks.length - activeIndex.current - 1
          )
        )(previewNormalItemHeight)
      }

      activeIndex.current = newActiveIndex
    }
  })

  return (
    <main>
      <Head>
        <title>Franka</title>
        <meta name="description" content="Franka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={s.center} style={{ height: itemHeight || 'auto' }}>
        {/* {process.env.NODE_ENV === 'development' && <div className={s.debug} />} */}
      </div>

      <div style={{ height: scrollHeight || 'auto' }} />

      <ul
        className={s.preview}
        ref={(node) => {
          previewRef.current = node
          previewRectRef(node)
        }}
      >
        {[...selectedWorks].reverse().map(({ title, thumbnail }, i) => {
          return (
            <li key={i} className={s.thumbnail}>
              <Image
                src={thumbnail.url}
                fill
                alt={title}
                quality={15}
                priority
              />
            </li>
          )
        })}
      </ul>

      <ul
        ref={(node) => {
          listRef.current = node
          listRectRef(node)
        }}
        className={s.list}
      >
        {selectedWorks.map(({ title }, i) => (
          <li key={i}>
            <Link href="/">
              <h2
                className={cn(s.title, robotoFlex.className)}
                onMouseEnter={(event) => {
                  hoverTitle(event.target, 'on')
                }}
                onMouseLeave={(event) => {
                  hoverTitle(event.target, 'off')
                }}
              >
                {title}
              </h2>
            </Link>
          </li>
        ))}
      </ul>
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

  const data = await res.json()

  return {
    props: {
      selectedWorks: data.data.collectionCollection.items,
    },
  }
}

const PARAMS = {
  activate: {
    on: {
      duration: 0.15,
      '--wght': 1000,
      '--wdth': 100,
      '--opacity': 1,
    },
    off: {
      duration: 0.3,
      '--wght': 100,
      '--wdth': 25,
      '--opacity': 0.2,
    },
  },
  hover: {
    on: {
      duration: 0.3,
      '--slnt': -10,
    },
    off: {
      duration: 0.3,
      '--slnt': 0,
    },
  },
}

type Target = Element | EventTarget | null

function activateTitle(target: Target, type: 'on' | 'off') {
  gsap.to(target, {
    ...PARAMS.activate[type],
  })
}

function hoverTitle(target: Target, type: 'on' | 'off') {
  gsap.to(target, {
    ...PARAMS.hover[type],
  })
}
