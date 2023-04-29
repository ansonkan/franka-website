import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { gql } from '@/lib/contentful-gql'
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

const ProjectPage: NextPage<ProjectPageProps> = ({ project }) => {
  const lenis = useStore((state) => state.lenis)

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
  }, [lenis])

  return (
    <main>
      <Head>
        <title>Franka</title>
        <meta name="description" content="Franka" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>{JSON.stringify(project)}</div>

      <div>{project.title}</div>

      {[project.thumbnail, ...project.photosCollection.items].map(
        (photo, i) => (
          <div
            key={i}
            style={{ position: 'relative', width: '100vw', height: '100vh' }}
          >
            <Image
              src={photo.url}
              fill
              alt={project.title + i}
              sizes="(min-width: 800px) 25vw, 50vw"
              style={{ objectFit: 'contain' }}
            />
          </div>
        )
      )}
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
