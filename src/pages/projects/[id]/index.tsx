import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import {
  ProjectDocument,
  ProjectQuery,
  ProjectsDocument,
  SelectedProjectsQuery,
} from '@/gql/graphql'
import { useLayoutEffect, useRef, useState } from 'react'
import { ContentfulRichText } from '@/components/contentful-rich-text'
import { FillImage } from '@/components/fill-image'
import { LOCALES } from '@/constants'
import Link from 'next/link'
import { client } from '@/lib/contentful-gql'
import cn from 'clsx'
import { getSelectedProjects } from '@/lib/queries/ssg-queries'
import gsap from 'gsap'
import s from './projects_id.module.scss'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useScroll } from '@/lib/use-scroll'
import { useStore } from '@/lib/use-store'

interface ProjectPageProps {
  project: NonNullable<ProjectQuery['projects']>
  nextSelectedProject?: NonNullable<
    NonNullable<
      NonNullable<
        SelectedProjectsQuery['selectedProjectsCollection']
      >['items'][number]
    >['projectsCollection']
  >['items'][number]
}

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

            {project.description?.json && (
              <div className={s.meta}>
                <ContentfulRichText>
                  {project.description.json}
                </ContentfulRichText>
              </div>
            )}
          </div>
        </div>

        <ol className={s.overview}>
          {project.previewsCollection?.items.map((photo, i) => {
            if (!photo || !photo.url) return

            return (
              <li
                key={photo.sys.id}
                className={s.overviewImgWrapper}
                onClick={() => {
                  lenis?.scrollTo(`.${s.galleryImgWrapper}:nth-child(${i + 1})`)
                }}
              >
                <FillImage
                  src={photo.url}
                  alt={project.title || '' + ` ${i}`}
                  sizes="15vw"
                />
              </li>
            )
          })}
        </ol>

        <div className={s.two}>
          <ol className={s.gallery} ref={galleryRef}>
            {project.mediaCollection?.items.map((photo, i) => {
              if (!photo || !photo.url) return

              const { width, height } = photo

              return (
                <li
                  key={photo.sys.id}
                  className={s.galleryImgWrapper}
                  style={
                    width && height
                      ? { aspectRatio: width / height }
                      : undefined
                  }
                >
                  <FillImage
                    src={photo.url}
                    alt={project.title || '' + ` ${i}`}
                    sizes="33vw"
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

                <div className={cn(s.overview, s.reverse)}>
                  {nextSelectedProject?.previewsCollection?.items.map(
                    (preview, i) => {
                      if (!preview || !preview.url) return

                      return (
                        <Link
                          key={preview.sys.id}
                          href={`/projects/${nextSelectedProject.sys.id}`}
                          className={s.overviewImgWrapper}
                        >
                          <FillImage
                            src={preview.url}
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
  const data = await client.request(ProjectsDocument, { locale: 'en-US' })

  return {
    paths: (
      data.projectsCollection?.items
        .filter((item) => !!item)
        .map((item) => ({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          params: { id: item!.sys.id },
        })) || []
    ).reduce((acc, cur) => {
      LOCALES.forEach((l) => {
        acc = [...acc, { ...cur, locale: l }]
      })

      return acc
    }, [] as any),
    fallback: false, // can also be true or 'blocking'
  }
}

export const getStaticProps: GetStaticProps<ProjectPageProps, Params> = async ({
  params,
  locale = 'en-US',
}) => {
  if (!params?.id) {
    return {
      notFound: true,
    }
  }

  const selectedProjects = await getSelectedProjects(locale)

  const data = await client.request(ProjectDocument, {
    id: params.id,
    locale,
  })

  if (!data.projects) {
    return {
      notFound: true,
    }
  }

  const translations = await serverSideTranslations(locale, ['common'])

  const indexInSelectedProjects =
    selectedProjects?.selectedProjectsCollection?.items[0]?.projectsCollection?.items.findIndex(
      (selectedProject) => selectedProject?.sys.id === params.id
    )

  const nextSelectedProject =
    typeof indexInSelectedProjects === 'number' &&
    indexInSelectedProjects > -1 &&
    indexInSelectedProjects + 1 <
      (selectedProjects?.selectedProjectsCollection?.items[0]
        ?.projectsCollection?.items.length || 0)
      ? selectedProjects?.selectedProjectsCollection?.items[0]
          ?.projectsCollection?.items[indexInSelectedProjects + 1]
      : undefined

  if (nextSelectedProject) {
    return {
      props: {
        ...translations,
        project: data.projects,
        nextSelectedProject,
      },
    }
  }

  return {
    props: {
      ...translations,
      project: data.projects,
    },
  }
}
