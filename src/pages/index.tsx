import { GetStaticProps, NextPage } from 'next'
import { useEffect, useMemo, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'clsx'
import { gql } from '@/lib/contentful-gql'
import gsap from 'gsap'
import { mapRange } from '@/lib/maths'
import s from './index.module.scss'
import { useRect } from '@studio-freight/hamo'
import { useScroll } from '@/lib/use-scroll'
import { useStore } from '@/lib/use-store'

type Photo = {
  url: string
  width: number
  height: number
}
interface Project {
  sys: { id: string }
  title: string
  thumbnail: Photo
  photosCollection: {
    items: Photo[]
  }
}

interface IndexProps {
  projects: Project[]
}

const Index: NextPage<IndexProps> = ({ projects }) => {
  const [sampleRectRef, sampleRect] = useRect()
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLUListElement>(null)
  const gotosRef = useRef<HTMLUListElement>(null)

  useScroll(({ scroll }) => {
    if (
      !scrollDivRef.current ||
      !sampleRect ||
      !gotosRef.current ||
      !linksRef.current
    )
      return

    scrollDivRef.current.style.setProperty(
      'height',
      `${window.innerHeight + sampleRect.height * (projects.length - 1) * 2}px`
    )

    gsap.to([linksRef.current, gotosRef.current], {
      y: -scroll / 2,
      duration: 0,
      ease: 'none',
    })
  })

  return (
    <main>
      <Head>
        <title>Franka</title>
        <meta name="description" content="Franka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div ref={scrollDivRef} />

      <div className={s.base}>
        <ul className={s.list} ref={gotosRef}>
          {projects.map(({ sys: { id }, title }, i) => (
            <li key={id + i} className={s.goto} onClick={() => console.log(id)}>
              {title}
            </li>
          ))}
        </ul>

        <div className={s.target}>
          <div className={s.sample} ref={sampleRectRef}>
            BASE
          </div>

          <ul className={s.list} ref={linksRef}>
            {projects.map(({ sys: { id }, title }, i) => (
              <li key={id + i}>
                <Link className={s.link} href={`/projects/${id}`}>
                  {title}
                </Link>
              </li>
            ))}
          </ul>
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
        photosCollection {
          items {
            url
            width
            height
          }
        }
      }
    }
  }`)

  return {
    props: {
      projects: [
        ...collectionCollection.items,
        ...collectionCollection.items,
        ...collectionCollection.items,
        ...collectionCollection.items,
        ...collectionCollection.items,
        ...collectionCollection.items,
        ...collectionCollection.items,
        ...collectionCollection.items,
      ],
    },
  }
}
