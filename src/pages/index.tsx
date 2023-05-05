import { GetStaticProps, NextPage } from 'next'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gql } from '@/lib/contentful-gql'
import gsap from 'gsap'
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

const SCROLL_DISTANCE_FACTOR = 5
const PREVIEW_SIDE_IMAGES_POSITIONS = [
  ['translate(-140%, -10%)', 'translate(25%, -60%)'],
  ['translate(-150%, 20%)', 'translate(35%, -120%)'],
  ['translate(-130%, -120%)', 'translate(40%, 20%)'],
  ['translate(-120%, 30%)', 'translate(60%, -60%)'],
]

const Index: NextPage<IndexProps> = ({ projects }) => {
  const lenis = useStore(({ lenis }) => lenis)

  const [sampleRectRef, sampleRect] = useRect()
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const linkListRef = useRef<HTMLUListElement>(null)
  const gotoListRef = useRef<HTMLUListElement>(null)

  const previewImages = useRef<
    Array<{ group: HTMLDivElement; children: HTMLDivElement[] }>
  >([])

  const setupScrollTrigger = useRef(false)

  useEffect(() => {
    if (setupScrollTrigger.current) return

    document
      .querySelectorAll<HTMLDivElement>(`.${s.previewGroup}`)
      .forEach((group, i) => {
        const children: HTMLDivElement[] = []
        group
          .querySelectorAll<HTMLDivElement>(`.${s.previewImage}`)
          .forEach((node) => children.push(node))

        previewImages.current[i] = { group, children }
      })

    setupScrollTrigger.current = true
  }, [])

  useScroll(({ scroll }) => {
    if (
      !scrollDivRef.current ||
      !sampleRect ||
      !gotoListRef.current ||
      !linkListRef.current
    )
      return

    gsap.set(scrollDivRef.current, {
      height:
        window.innerHeight +
        sampleRect.height * (projects.length - 1) * SCROLL_DISTANCE_FACTOR,
    })

    gsap.to([linkListRef.current, gotoListRef.current], {
      y: -scroll / SCROLL_DISTANCE_FACTOR,
      duration: 0,
      ease: 'none',
    })

    gsap.to(`.${s.previewsContainer}`, {
      y:
        (-scroll / SCROLL_DISTANCE_FACTOR) *
        (window.innerHeight / sampleRect.height),
    })
  })

  return (
    <main>
      <div ref={scrollDivRef} />

      <div className={s.previewsContainer}>
        {projects.map(
          (
            { sys: { id }, thumbnail, photosCollection: { items }, title },
            i
          ) => (
            <div key={id + i} className={s.previewGroup}>
              {[thumbnail, ...items]
                .slice(0, 3)
                .map(({ url, width, height }, j) => {
                  const isThumbnail = j === 0

                  return (
                    <div
                      key={id + url + j}
                      className={s.previewImage}
                      style={{
                        aspectRatio: width / height,
                        width: isThumbnail ? '60vw' : '30vw',
                        height: `calc(${
                          isThumbnail ? 60 : 30
                        } * var(--vh, 1vh))`,
                        transform:
                          j === 0
                            ? undefined
                            : PREVIEW_SIDE_IMAGES_POSITIONS[
                                (i + 1) % PREVIEW_SIDE_IMAGES_POSITIONS.length
                              ][j % 2],
                      }}
                    >
                      <Image src={url} fill sizes="40vw" alt={title} />
                    </div>
                  )
                })}
            </div>
          )
        )}
      </div>

      <div className={s.menuContainer}>
        <ul className={s.list} ref={gotoListRef}>
          {projects.map(({ sys: { id }, title }, i) => (
            <li
              key={id + i}
              className={s.goto}
              onClick={() => {
                lenis?.scrollTo(
                  sampleRect.height * i * SCROLL_DISTANCE_FACTOR,
                  {
                    // Note: without this, `scrollTo` seems to be never ending and keeps triggering `scroll` event
                    duration: 1,
                  }
                )
              }}
            >
              {title}
            </li>
          ))}
        </ul>

        <div className={s.menuLinkArea}>
          <div className={s.sample} ref={sampleRectRef}>
            BASE
          </div>

          <ul className={s.list} ref={linkListRef}>
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
      projects: collectionCollection.items,
    },
  }
}
