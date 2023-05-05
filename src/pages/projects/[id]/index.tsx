import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Image from 'next/image'
import cn from 'clsx'
import { gql } from '@/lib/contentful-gql'
import s from './projects_id.module.scss'
import { useEffect } from 'react'
import { useStore } from '@/lib/use-store'

interface Project {
  sys: { id: string }
  title: string
  thumbnail: {
    width: number
    height: number
    url: string
  }
  photosCollection: {
    items: {
      width: number
      height: number
      url: string
    }[]
  }
}

interface ProjectPageProps {
  project: Project
}

const ProjectPage: NextPage<ProjectPageProps> = ({
  project: { title, thumbnail, photosCollection },
}) => {
  const lenis = useStore(({ lenis }) => lenis)

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
  }, [lenis])

  return (
    <main>
      <div className={cn('page', s.root)}>
        <div className={s.thumbnailContainer}>
          <div
            className={s.thumbnailWrapper}
            style={{
              aspectRatio: thumbnail.width / thumbnail.height,
            }}
          >
            <Image src={thumbnail.url} fill alt={title} sizes="40vw" />
          </div>

          <h1>{title}</h1>
        </div>

        {photosCollection.items.map(({ url, width, height }, i) => {
          return (
            <div
              key={i}
              className={s.imageWrapper}
              style={{
                aspectRatio: width / height,
              }}
            >
              <Image src={url} fill alt={title + i} sizes="40vw" />
            </div>
          )
        })}
      </div>
    </main>
  )
}

export default ProjectPage

export const getStaticPaths: GetStaticPaths<{ id: string }> = async () => {
  const { collectionCollection } = await gql<{
    collectionCollection: {
      items: { sys: { id: string } }[]
    }
  }>(`{
    collectionCollection {
      items {
        sys {
          id
        }
      }
    }
  }`)

  return {
    paths: collectionCollection.items.map((item) => ({
      params: { id: item.sys.id },
    })),
    fallback: false, // can also be true or 'blocking'
  }
}

export const getStaticProps: GetStaticProps<
  ProjectPageProps,
  { id: string }
> = async ({ params }) => {
  const { collection } = await gql<{
    collection: Project
  }>(`{
    collection(id: "${params?.id}") {
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
          width
          height
          url
        }
      }
    }
  }`)

  return {
    props: {
      project: collection,
    },
  }
}
