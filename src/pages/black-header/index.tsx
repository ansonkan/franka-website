import { Fragment, useEffect } from 'react'
import { GetStaticProps, NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'clsx'
import { gql } from '@/lib/contentful-gql'
import s from './black-header.module.scss'
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

interface BlackHeaderProps {
  projects: Project[]
}

const BlackHeader: NextPage<BlackHeaderProps> = ({ projects }) => {
  const lenis = useStore(({ lenis }) => lenis)

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
  }, [lenis])

  return (
    <main>
      <div className={s.header}>
        <h1>Franka Robin Zweydinger</h1>

        <div className={s.links}>
          {['portfolio', 'advertising', 'contact', 'social media'].map(
            (link, i) => {
              return (
                <Fragment key={link}>
                  {i > 0 && <p className={s.divider}>/</p>}
                  <Link href={`/${link}`}>{link}</Link>
                </Fragment>
              )
            }
          )}
        </div>
      </div>

      <div className={cn('page', s.root)}>
        {projects.map(({ title, thumbnail: { width, height, url } }, i) => {
          return (
            <div
              key={i}
              className={s.imageWrapper}
              style={{
                aspectRatio: width / height,
              }}
            >
              <Image src={url} fill alt={title + i} sizes="40vw" />
              <div className={s.title}>{title}</div>
            </div>
          )
        })}
      </div>

      <div className={s.footer}>
        copyright {new Date().getFullYear()} Franka Robin Zweydinger /{' '}
        <Link href="/imprint">Imprint</Link>
      </div>
    </main>
  )
}

export default BlackHeader

export const getStaticProps: GetStaticProps<BlackHeaderProps> = async () => {
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
