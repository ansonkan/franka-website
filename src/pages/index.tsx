import { GetStaticProps, NextPage } from 'next'
import { useMemo, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'clsx'
import { emberly } from '@/fonts'
import { gql } from '@/lib/contentful-gql'
import gsap from 'gsap'
import s from './index.module.scss'
import { useMediaQuery } from '@studio-freight/hamo'

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
  selectedWorks: Work[]
}

const Index: NextPage<IndexProps> = ({ selectedWorks }) => {
  const isMd = useMediaQuery('(min-width: 800px)')
  const isLg = useMediaQuery('(min-width: 1200px)')

  const [title, setTitle] = useState('')

  const galleryCols = useMemo(() => {
    const getCols = (colCount = 1) => {
      const columns: Array<Array<Work>> = []
      for (let i = 0; i < colCount; i++) {
        columns.push([])
      }

      for (let i = 0; i < selectedWorks.length; i++) {
        columns[i % colCount].push(selectedWorks[i])
      }

      return columns
    }

    return {
      base: getCols(2),
      md: getCols(3),
      lg: getCols(4),
    }
  }, [selectedWorks])

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

      <div className={s.gallery}>
        {galleryCols[breakpoint].map((col, i) => (
          <div key={i} className={s.column}>
            {col.map(({ title, thumbnail, sys }, i) => (
              <Link
                key={i}
                href={`/works/${sys.id}`}
                className={s.imageWrapper}
                style={{ aspectRatio: thumbnail.width / thumbnail.height }}
                onMouseEnter={() => {
                  setTitle(title)
                  gsap.to(`.${s.title}`, { opacity: 1 })
                }}
                onMouseLeave={() => {
                  gsap.to(`.${s.title}`, { opacity: 0 })
                }}
              >
                <Image
                  src={thumbnail.url}
                  fill
                  alt={title}
                  sizes="(min-width: 800px) 20vw, 50vw"
                />
              </Link>
            ))}
          </div>
        ))}
      </div>

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

export const getStaticProps: GetStaticProps<IndexProps> = async () => {
  const { collectionCollection } = await gql<{
    collectionCollection: {
      items: Work[]
    }
  }>(`
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
`)

  return {
    props: {
      selectedWorks: [
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
