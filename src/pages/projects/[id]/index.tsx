import {
  CollectionCollectionDocument,
  CollectionEntryDocument,
  CollectionEntryQuery,
  SelectedProjectsCollectionQuery,
} from '@/gql/graphql'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/lib/contentful-gql'
import cn from 'clsx'
import { getSelectedProjects } from '@/lib/queries/ssg-queries'
import gsap from 'gsap'
import s from './projects_id.module.scss'
import { useRouter } from 'next/router'
import { useScroll } from '@/lib/use-scroll'
import { useStore } from '@/lib/use-store'

interface ProjectPageProps {
  project: NonNullable<CollectionEntryQuery['collection']>
  nextSelectedProject?: NonNullable<
    NonNullable<
      NonNullable<
        SelectedProjectsCollectionQuery['selectedProjectsCollection']
      >['items'][number]
    >['projectsCollection']
  >['items'][number]
}

// TODO: add this to Contentful
const meta = 'King Gnu\nChainsaw Man\nPolyphia Studio'

const ProjectPage: NextPage<ProjectPageProps> = ({
  project,
  nextSelectedProject,
}) => {
  const lenis = useStore(({ lenis }) => lenis)
  const { asPath } = useRouter()

  const galleryRef = useRef<HTMLOListElement | null>(null)
  const outroRef = useRef<HTMLDivElement | null>(null)

  const [scrollHeight, setScrollHeight] = useState(0)

  useLayoutEffect(() => {
    const onResize = () => {
      const isDesktop = window.innerWidth >= 800

      /**
       * Note:
       * - `useRect` returns `width` without the padding, so use `getBoundingClientRect` instead
       * - `window.innerHeight` -> 100vh plus the 2vh from `--overview-square-gap`
       * - `window.innerWidth` -> minus 100vw but add back the 2vw from `--header-px`
       */
      setScrollHeight(
        isDesktop
          ? Math.max(
              0,
              (galleryRef.current?.getBoundingClientRect().width || 0) +
                (outroRef.current?.getBoundingClientRect().width || 0) +
                window.innerHeight * (1 + 0.02) -
                window.innerWidth * (1 - 0.02)
            )
          : 0
      )

      if (!isDesktop) {
        gsap.set([galleryRef.current, outroRef.current], {
          x: 0,
        })
      }
    }

    onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }

    /**
     * Note:
     * This page component is not unmounted if changing to another `/projects/[id]` page,
     * so this needs to react to the path
     */
  }, [asPath])

  useScroll(({ scroll }) => {
    const isDesktop = window.innerWidth >= 800

    if (!isDesktop) return

    /**
     * Note:
     * If using the element references directly, whenever I left from `/projects/[id]` to other pages, I got "Cannot read properties of null (reading '_gsap')",
     * but using classes seems fine.
     *
     * Same error mentioned in https://greensock.com/forums/topic/29398-cannot-read-properties-of-null-reading-_gsap/
     * but I don't understand what was the cause still
     *
     * I suspect the scheduled gsap tweens break when running with these dead element references after page component unmounted
     */
    // gsap.to([galleryRef.current, outroRef.current], {
    gsap.to([`.${s.gallery}`, `.${s.outro}`], {
      x: -scroll,
      duration: 0,
      ease: 'none',
    })
  })

  return (
    <>
      <div style={{ height: scrollHeight }} />

      <main className={s.root}>
        <div className={s.intro}>
          <div className={s.info}>
            {project.title && <h1 className={s.title}>{project.title}</h1>}

            {meta && (
              <div className={s.meta}>
                {meta.split('\n').map((x, i) => (
                  <p key={i}>{x}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        <ol className={s.overviews}>
          {project.photosCollection?.items.map((photo, i) => {
            if (!photo || !photo.url) return

            return (
              <li
                key={i}
                className={s.overviewsImgWrapper}
                onClick={() => {
                  lenis?.scrollTo(`.${s.galleryImgWrapper}:nth-child(${i + 1})`)
                }}
              >
                <Image
                  src={photo.url}
                  fill
                  alt={project.title || '' + ` ${i}`}
                  sizes="20vw"
                />
              </li>
            )
          })}
        </ol>

        <div className={s.two}>
          <ol className={s.gallery} ref={galleryRef}>
            {project.photosCollection?.items.map((photo, i) => {
              if (!photo || !photo.url) return

              const { width, height } = photo

              return (
                <li
                  key={i}
                  className={s.galleryImgWrapper}
                  style={
                    width && height
                      ? { aspectRatio: width / height }
                      : undefined
                  }
                >
                  <Image
                    src={photo.url}
                    fill
                    alt={project.title || '' + ` ${i}`}
                    sizes="50vw"
                  />
                </li>
              )
            })}
          </ol>

          <div className={s.outro} ref={outroRef}>
            {nextSelectedProject?.previewsCollection?.items.length && (
              <>
                <Link
                  href={`/projects/${nextSelectedProject.sys.id}`}
                  className={s.next}
                >
                  {'> next'}
                </Link>

                <div className={cn(s.overviews, s.reverse)}>
                  {nextSelectedProject?.previewsCollection?.items.map(
                    (preview, i) => {
                      if (!preview || !preview.url) return

                      return (
                        <Link
                          key={i}
                          href={`/projects/${nextSelectedProject.sys.id}`}
                          className={s.overviewsImgWrapper}
                        >
                          <Image
                            src={preview.url}
                            fill
                            alt={project.title || '' + ` ${i}`}
                            sizes="20vw"
                          />
                        </Link>
                      )
                    }
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default ProjectPage

type Params = {
  id: string
}

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const data = await client.request(CollectionCollectionDocument)

  return {
    paths:
      data.collectionCollection?.items
        .filter((item) => !!item)
        .map((item) => ({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          params: { id: item!.sys.id },
        })) || [],
    fallback: false, // can also be true or 'blocking'
  }
}

export const getStaticProps: GetStaticProps<ProjectPageProps, Params> = async ({
  params,
}) => {
  if (!params?.id) {
    return {
      notFound: true,
    }
  }

  const selectedProjects = await getSelectedProjects()

  const data = await client.request(CollectionEntryDocument, { id: params.id })

  if (!data.collection) {
    return {
      notFound: true,
    }
  }

  const indexInSelectedProjects =
    selectedProjects.selectedProjectsCollection?.items[0]?.projectsCollection?.items.findIndex(
      (selectedProject) => selectedProject?.sys.id === params.id
    )

  const nextSelectedProject =
    typeof indexInSelectedProjects === 'number' &&
    indexInSelectedProjects > -1 &&
    indexInSelectedProjects + 1 <
      (selectedProjects.selectedProjectsCollection?.items[0]?.projectsCollection
        ?.items.length || 0)
      ? selectedProjects.selectedProjectsCollection?.items[0]
          ?.projectsCollection?.items[indexInSelectedProjects + 1]
      : undefined

  if (nextSelectedProject) {
    return {
      props: {
        project: data.collection,
        nextSelectedProject,
      },
    }
  }

  return {
    props: {
      project: data.collection,
    },
  }
}
