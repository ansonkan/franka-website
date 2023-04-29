import { GetStaticProps, NextPage } from 'next'
import { useEffect, useMemo, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { gql } from '@/lib/contentful-gql'
import gsap from 'gsap'
import { mapRange } from '@/lib/maths'
import s from './index.module.scss'
import { useScroll } from '@/lib/use-scroll'

interface Project {
  sys: { id: string }
  title: string
  thumbnail: {
    width: number
    height: number
    url: string
  }
}

interface IndexProps {
  projects: Project[]
}

const IMG_HEIGHT = 'min(75vh, 90vw)'
const GALLERY_GAP = '5vw'
const PARALLAX_DISTANCE = 100

const Index: NextPage<IndexProps> = ({ projects }) => {
  const galleryRef = useRef<HTMLDivElement>(null)
  const parallaxs = useRef<HTMLDivElement[] | undefined>()

  const minAR = useMemo(() => {
    return projects.reduce((acc, { thumbnail: { width, height } }) => {
      const ar = width / height

      return ar < acc ? ar : acc
    }, Infinity)
  }, [projects])

  useEffect(() => {
    parallaxs.current = []
    galleryRef.current
      ?.querySelectorAll<HTMLDivElement>(`.${s.parallax}`)
      .forEach((item) => {
        parallaxs.current?.push(item)
      })

    gsap.to(parallaxs.current, {
      x: '-50%',
      ease: 'none',
      duration: 0,
    })
  }, [])

  useScroll(({ scroll }) => {
    const screenWidth = window.innerWidth

    if (parallaxs.current) {
      for (const item of parallaxs.current) {
        const { left, width } = item.getBoundingClientRect()

        if (left + width <= 0) continue
        if (left > screenWidth) break

        gsap.to(item, {
          x:
            mapRange(
              screenWidth,
              -width,
              left,
              -(PARALLAX_DISTANCE / 2),
              PARALLAX_DISTANCE / 2
            ) -
            width / 2,
          ease: 'none',
          duration: 0,
        })
      }
    }

    gsap.to(galleryRef.current, { x: -scroll, ease: 'none', duration: 0 })
  })

  return (
    <main>
      <Head>
        <title>Franka</title>
        <meta name="description" content="Franka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        style={{
          height: `calc(100vh + ${projects.length - 1} * ((${IMG_HEIGHT} / ${
            1 / minAR
          }) - ${PARALLAX_DISTANCE}px + ${GALLERY_GAP}))`,
        }}
      />

      <div className={s.base}>
        <div
          className={s.gallery}
          ref={galleryRef}
          style={{
            height: IMG_HEIGHT,
            width: `calc((${IMG_HEIGHT} / ${
              1 / minAR
            }) - ${PARALLAX_DISTANCE}px)`,
          }}
        >
          {projects.map(({ title, thumbnail, sys }, i) => (
            <Link
              key={i}
              href={`projects/${sys.id}`}
              className={s.frame}
              style={{
                transform: `translateX(calc((100% + ${GALLERY_GAP}) * ${i}))`,
              }}
            >
              <div
                className={s.parallax}
                style={{
                  width: `calc(${IMG_HEIGHT} * ${
                    thumbnail.width / thumbnail.height
                  })`,
                }}
              >
                <Image
                  src={thumbnail.url}
                  fill
                  alt={title}
                  sizes="(min-width: 800px) 25vw, 50vw"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

export default Index

export const getStaticProps: GetStaticProps<IndexProps> = async () => {
  const { collectionCollection } = await gql<{
    collectionCollection: {
      items: Project[]
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
      projects: collectionCollection.items,
    },
  }
}
